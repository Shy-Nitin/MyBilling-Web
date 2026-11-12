from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from fastapi import HTTPException
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.product import Product
from backend.app.models.shop import Shop
from backend.app.models.ledger import LedgerEntry
from backend.app.schemas.invoice import InvoiceCreate, InvoiceUpdate

def generate_invoice_number(db: Session) -> str:
    count = db.query(Invoice).count() + 1
    today_str = datetime.utcnow().strftime("%Y%m%d")
    return f"INV-{today_str}-{count:04d}"

def generate_entry_number(db: Session, offset: int = 0) -> str:
    count = db.query(LedgerEntry).count() + 1 + offset
    suffix = uuid.uuid4().hex[:4].upper()
    return f"JRN-{datetime.utcnow().strftime('%Y%m')}-{count:04d}-{suffix}"

def create_sale_invoice(db: Session, invoice_in: InvoiceCreate) -> Invoice:
    # 1. Validation & calculation
    if not invoice_in.items:
        raise HTTPException(status_code=400, detail="Invoice must contain at least one line item.")

    subtotal = 0.0
    total_discount = 0.0
    total_tax = 0.0 # GST completely removed for now

    line_items_data = []

    for item_in in invoice_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item_in.product_id} not found.")

        # Selling price determines total; MRP is informational
        selling_rate = item_in.unit_rate
        item_qty = item_in.quantity

        # Decrement stock
        product.stock_qty -= item_qty

        # Calculation without GST
        item_subtotal = selling_rate * item_qty
        item_disc = (item_subtotal * (item_in.discount_percent / 100.0))
        item_total = item_subtotal - item_disc

        subtotal += item_subtotal
        total_discount += item_disc

        line_items_data.append({
            "product_id": product.id,
            "sku": product.sku,
            "product_name": product.name,
            "pack_size": product.pack_size,
            "quantity": item_qty,
            "unit": product.unit or "PCS",
            "unit_rate": selling_rate,
            "unit_cost": product.landed_cost, # Historical cost snapshot for profitability reporting
            "mrp": product.mrp,
            "discount_percent": item_in.discount_percent,
            "discount_amount": round(item_disc, 2),
            "tax_rate": 0.0,
            "tax_amount": 0.0,
            "total_amount": round(item_total, 2),
        })

    grand_total = round(subtotal - total_discount, 2)
    
    # Determine paid vs balance
    if invoice_in.payment_mode in ["CASH", "UPI"]:
        paid_amount = grand_total if invoice_in.paid_amount is None else invoice_in.paid_amount
    elif invoice_in.payment_mode == "UDHAR_CREDIT":
        paid_amount = 0.0 if invoice_in.paid_amount is None else invoice_in.paid_amount
    else: # SPLIT
        paid_amount = invoice_in.paid_amount or 0.0

    balance_amount = max(0.0, round(grand_total - paid_amount, 2))
    
    if balance_amount == 0.0:
        payment_status = "PAID"
    elif paid_amount > 0.0:
        payment_status = "PARTIAL"
    else:
        payment_status = "UNPAID"

    # Create Invoice record
    invoice = Invoice(
        invoice_number=generate_invoice_number(db),
        shop_id=invoice_in.shop_id,
        customer_name=invoice_in.customer_name,
        customer_phone=invoice_in.customer_phone,
        subtotal=round(subtotal, 2),
        discount_amount=round(total_discount, 2),
        tax_amount=0.0,
        total_amount=grand_total,
        paid_amount=paid_amount,
        balance_amount=balance_amount,
        payment_mode=invoice_in.payment_mode,
        payment_status=payment_status,
        notes=invoice_in.notes,
        created_at=datetime.utcnow()
    )
    db.add(invoice)
    db.flush()

    # Create Invoice Items
    for item_data in line_items_data:
        item = InvoiceItem(
            invoice_id=invoice.id,
            **item_data
        )
        db.add(item)

    # If linked to a shop, update Udhar / shop balance
    if invoice_in.shop_id and balance_amount > 0:
        shop = db.query(Shop).filter(Shop.id == invoice_in.shop_id).with_for_update().first()
        if shop:
            shop.current_balance += balance_amount

    # Create double-entry ledger records
    # 1. Revenue Entry
    revenue_entry = LedgerEntry(
        entry_number=generate_entry_number(db, offset=0),
        transaction_date=datetime.utcnow(),
        reference_type="SALE_INVOICE",
        reference_id=invoice.invoice_number,
        shop_id=invoice.shop_id,
        account_type="REVENUE",
        description=f"Sales Invoice {invoice.invoice_number} - {invoice.customer_name}",
        credit_amount=grand_total,
        debit_amount=0.0,
        running_balance=0.0,
        payment_mode=invoice.payment_mode
    )
    db.add(revenue_entry)

    # 2. Cash/Bank received
    if paid_amount > 0:
        cash_entry = LedgerEntry(
            entry_number=generate_entry_number(db, offset=1),
            transaction_date=datetime.utcnow(),
            reference_type="PAYMENT_RECEIVED",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="CASH" if invoice.payment_mode == "CASH" else "BANK",
            description=f"Payment for {invoice.invoice_number} ({invoice.payment_mode})",
            debit_amount=paid_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode=invoice.payment_mode
        )
        db.add(cash_entry)

    # 3. Accounts Receivable (Udhar)
    if balance_amount > 0:
        ar_entry = LedgerEntry(
            entry_number=generate_entry_number(db, offset=2),
            transaction_date=datetime.utcnow(),
            reference_type="UDHAR_CREDIT",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="ACCOUNTS_RECEIVABLE",
            description=f"Outstanding credit on {invoice.invoice_number} for {invoice.customer_name}",
            debit_amount=balance_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode="UDHAR_CREDIT"
        )
        db.add(ar_entry)

    db.commit()
    db.refresh(invoice)
    return invoice

def update_sale_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate) -> Invoice:
    """
    Updates an existing invoice in place:
    - Retains original invoice ID and original invoice number
    - Reconciles inventory stock (restores old items, decrements new items)
    - Reconciles shop Udhar ledger balance
    - Recalculates subtotal, discount, total, paid, and balance without GST
    - Updates ledger entries
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).with_for_update().first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice with ID {invoice_id} not found.")

    # 1. Restore stock from old line items
    for old_item in invoice.items:
        prod = db.query(Product).filter(Product.id == old_item.product_id).with_for_update().first()
        if prod:
            prod.stock_qty += old_item.quantity

    # 2. Revert previous shop Udhar balance
    if invoice.shop_id and invoice.balance_amount > 0:
        old_shop = db.query(Shop).filter(Shop.id == invoice.shop_id).with_for_update().first()
        if old_shop:
            old_shop.current_balance = max(0.0, old_shop.current_balance - invoice.balance_amount)

    # 3. Process new line items or keep existing
    new_items_data = invoice_update.items if invoice_update.items is not None else []
    if not new_items_data:
        raise HTTPException(status_code=400, detail="Updated invoice must contain at least one line item.")

    subtotal = 0.0
    total_discount = 0.0
    line_items_data = []

    for item_in in new_items_data:
        product = db.query(Product).filter(Product.id == item_in.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item_in.product_id} not found.")

        selling_rate = item_in.unit_rate
        item_qty = item_in.quantity

        # Decrement stock for new quantity
        product.stock_qty -= item_qty

        # Calculation without GST
        item_subtotal = selling_rate * item_qty
        item_disc = item_subtotal * (item_in.discount_percent / 100.0)
        item_total = item_subtotal - item_disc

        subtotal += item_subtotal
        total_discount += item_disc

        line_items_data.append({
            "product_id": product.id,
            "sku": product.sku,
            "product_name": product.name,
            "pack_size": product.pack_size,
            "quantity": item_qty,
            "unit": product.unit or "PCS",
            "unit_rate": selling_rate,
            "unit_cost": product.landed_cost,
            "mrp": product.mrp,
            "discount_percent": item_in.discount_percent,
            "discount_amount": round(item_disc, 2),
            "tax_rate": 0.0,
            "tax_amount": 0.0,
            "total_amount": round(item_total, 2),
        })

    grand_total = round(subtotal - total_discount, 2)

    # Update metadata fields
    if invoice_update.customer_name is not None:
        invoice.customer_name = invoice_update.customer_name
    if invoice_update.customer_phone is not None:
        invoice.customer_phone = invoice_update.customer_phone
    if invoice_update.notes is not None:
        invoice.notes = invoice_update.notes
    if invoice_update.payment_mode is not None:
        invoice.payment_mode = invoice_update.payment_mode
    if invoice_update.shop_id is not None:
        invoice.shop_id = invoice_update.shop_id

    # Recalculate paid vs balance
    if invoice.payment_mode in ["CASH", "UPI"]:
        paid_amount = grand_total if invoice_update.paid_amount is None else invoice_update.paid_amount
    elif invoice.payment_mode == "UDHAR_CREDIT":
        paid_amount = 0.0 if invoice_update.paid_amount is None else invoice_update.paid_amount
    else: # SPLIT
        paid_amount = invoice_update.paid_amount if invoice_update.paid_amount is not None else invoice.paid_amount

    balance_amount = max(0.0, round(grand_total - paid_amount, 2))

    if balance_amount == 0.0:
        payment_status = "PAID"
    elif paid_amount > 0.0:
        payment_status = "PARTIAL"
    else:
        payment_status = "UNPAID"

    # Update invoice financial totals
    invoice.subtotal = round(subtotal, 2)
    invoice.discount_amount = round(total_discount, 2)
    invoice.tax_amount = 0.0
    invoice.total_amount = grand_total
    invoice.paid_amount = paid_amount
    invoice.balance_amount = balance_amount
    invoice.payment_status = payment_status

    # Delete existing items and add new items
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).delete()
    for item_data in line_items_data:
        new_item = InvoiceItem(
            invoice_id=invoice.id,
            **item_data
        )
        db.add(new_item)

    # Update new shop balance if balance_amount > 0
    if invoice.shop_id and balance_amount > 0:
        new_shop = db.query(Shop).filter(Shop.id == invoice.shop_id).with_for_update().first()
        if new_shop:
            new_shop.current_balance += balance_amount

    # Reconcile double-entry ledger records
    db.query(LedgerEntry).filter(LedgerEntry.reference_id == invoice.invoice_number).delete()

    # 1. Revenue Entry
    revenue_entry = LedgerEntry(
        entry_number=generate_entry_number(db, offset=0),
        transaction_date=datetime.utcnow(),
        reference_type="SALE_INVOICE",
        reference_id=invoice.invoice_number,
        shop_id=invoice.shop_id,
        account_type="REVENUE",
        description=f"Sales Invoice {invoice.invoice_number} (Updated) - {invoice.customer_name}",
        credit_amount=grand_total,
        debit_amount=0.0,
        running_balance=0.0,
        payment_mode=invoice.payment_mode
    )
    db.add(revenue_entry)

    # 2. Cash/Bank received
    if paid_amount > 0:
        cash_entry = LedgerEntry(
            entry_number=generate_entry_number(db, offset=1),
            transaction_date=datetime.utcnow(),
            reference_type="PAYMENT_RECEIVED",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="CASH" if invoice.payment_mode == "CASH" else "BANK",
            description=f"Payment for {invoice.invoice_number} ({invoice.payment_mode})",
            debit_amount=paid_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode=invoice.payment_mode
        )
        db.add(cash_entry)

    # 3. Accounts Receivable (Udhar)
    if balance_amount > 0:
        ar_entry = LedgerEntry(
            entry_number=generate_entry_number(db, offset=2),
            transaction_date=datetime.utcnow(),
            reference_type="UDHAR_CREDIT",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="ACCOUNTS_RECEIVABLE",
            description=f"Outstanding credit on {invoice.invoice_number} for {invoice.customer_name}",
            debit_amount=balance_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode="UDHAR_CREDIT"
        )
        db.add(ar_entry)

    db.commit()
    db.refresh(invoice)
    return invoice

def delete_sale_invoice(db: Session, invoice_id: int) -> dict:
    """
    Deletes an existing invoice:
    - Restores inventory quantities to original products
    - Reverts shop balance if Udhar/balance was outstanding
    - Cleans up associated ledger entries
    - Deletes line items and invoice
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).with_for_update().first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice with ID {invoice_id} not found.")

    invoice_number = invoice.invoice_number

    # 1. Restore product stock
    for item in list(invoice.items):
        prod = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if prod:
            prod.stock_qty += item.quantity
        db.delete(item)

    # 2. Revert shop Udhar balance
    if invoice.shop_id and invoice.balance_amount > 0:
        shop = db.query(Shop).filter(Shop.id == invoice.shop_id).with_for_update().first()
        if shop:
            shop.current_balance = max(0.0, shop.current_balance - invoice.balance_amount)

    # 3. Clean up double-entry ledger records
    db.query(LedgerEntry).filter(LedgerEntry.reference_id == invoice.invoice_number).delete(synchronize_session=False)

    # 4. Delete invoice
    db.delete(invoice)
    db.commit()

    return {
        "success": True,
        "message": f"Invoice {invoice_number} successfully deleted. Inventory and balances restored.",
        "invoice_id": invoice_id,
        "invoice_number": invoice_number
    }
