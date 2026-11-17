from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from fastapi import HTTPException
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.product import Product
from backend.app.models.shop import Shop
from backend.app.models.ledger import LedgerEntry
from backend.app.schemas.invoice import InvoiceCreate, InvoiceUpdate

def generate_invoice_number(db: Session, user_id: int = 1) -> str:
    count = db.query(Invoice).filter(Invoice.user_id == user_id).count() + 1
    today_str = datetime.utcnow().strftime("%Y%m%d")
    return f"INV-{today_str}-{count:04d}"

def generate_entry_number(db: Session, offset: int = 0, user_id: int = 1) -> str:
    count = db.query(LedgerEntry).filter(LedgerEntry.user_id == user_id).count() + 1 + offset
    suffix = uuid.uuid4().hex[:4].upper()
    return f"JRN-{datetime.utcnow().strftime('%Y%m')}-{count:04d}-{suffix}"

def create_sale_invoice(db: Session, invoice_in: InvoiceCreate, user_id: int = 1) -> Invoice:
    # 1. Validation & calculation
    if not invoice_in.items:
        raise HTTPException(status_code=400, detail="Invoice must contain at least one line item.")

    subtotal = 0.0
    total_discount = 0.0
    total_tax = 0.0 # GST completely removed for now

    line_items_data = []

    for item_in in invoice_in.items:
        product = db.query(Product).filter(
            Product.id == item_in.product_id,
            Product.user_id == user_id
        ).with_for_update().first()
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
            "landed_cost": product.landed_cost, # Historical cost snapshot for profitability reporting
            "tax_rate": 0.0,
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
        user_id=user_id,
        invoice_number=generate_invoice_number(db, user_id=user_id),
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
        shop = db.query(Shop).filter(
            Shop.id == invoice_in.shop_id,
            Shop.user_id == user_id
        ).with_for_update().first()
        if shop:
            shop.current_balance += balance_amount

    # Create double-entry ledger records
    # 1. Revenue Entry
    revenue_entry = LedgerEntry(
        user_id=user_id,
        entry_number=generate_entry_number(db, offset=0, user_id=user_id),
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
        account_name = "CASH" if invoice_in.payment_mode == "CASH" else "BANK"
        payment_entry = LedgerEntry(
            user_id=user_id,
            entry_number=generate_entry_number(db, offset=1, user_id=user_id),
            transaction_date=datetime.utcnow(),
            reference_type="SALE_INVOICE",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type=account_name,
            description=f"Payment for {invoice.invoice_number} via {invoice.payment_mode}",
            debit_amount=paid_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode=invoice.payment_mode
        )
        db.add(payment_entry)

    # 3. Accounts Receivable (Udhar)
    if balance_amount > 0:
        ar_entry = LedgerEntry(
            user_id=user_id,
            entry_number=generate_entry_number(db, offset=2, user_id=user_id),
            transaction_date=datetime.utcnow(),
            reference_type="SALE_INVOICE",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="ACCOUNTS_RECEIVABLE",
            description=f"Udhar credit extended on {invoice.invoice_number} for {invoice.customer_name}",
            debit_amount=balance_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode="UDHAR_CREDIT"
        )
        db.add(ar_entry)

    db.commit()
    db.refresh(invoice)
    return invoice

def update_sale_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate, user_id: int = 1) -> Invoice:
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == user_id
    ).with_for_update().first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice with ID {invoice_id} not found.")

    # 1. Restore stock from old line items
    for old_item in invoice.items:
        prod = db.query(Product).filter(
            Product.id == old_item.product_id,
            Product.user_id == user_id
        ).with_for_update().first()
        if prod:
            prod.stock_qty += old_item.quantity

    # 2. Revert previous shop Udhar balance
    if invoice.shop_id and invoice.balance_amount > 0:
        old_shop = db.query(Shop).filter(
            Shop.id == invoice.shop_id,
            Shop.user_id == user_id
        ).with_for_update().first()
        if old_shop:
            old_shop.current_balance = max(0.0, old_shop.current_balance - invoice.balance_amount)

    # 3. Process new line items or keep existing
    new_items_data = invoice_update.items if invoice_update.items is not None else []
    if not new_items_data:
        raise HTTPException(status_code=400, detail="Updated invoice must contain at least one line item.")

    subtotal = 0.0
    total_discount = 0.0
    processed_new_items = []

    for item_in in new_items_data:
        product = db.query(Product).filter(
            Product.id == item_in.product_id,
            Product.user_id == user_id
        ).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item_in.product_id} not found.")

        selling_rate = item_in.unit_rate
        item_qty = item_in.quantity

        product.stock_qty -= item_qty

        item_subtotal = selling_rate * item_qty
        item_disc = item_subtotal * (item_in.discount_percent / 100.0)
        item_total = item_subtotal - item_disc

        subtotal += item_subtotal
        total_discount += item_disc

        processed_new_items.append({
            "product_id": product.id,
            "sku": product.sku,
            "product_name": product.name,
            "pack_size": product.pack_size,
            "quantity": item_qty,
            "unit": product.unit or "PCS",
            "unit_rate": selling_rate,
            "landed_cost": product.landed_cost,
            "tax_rate": 0.0,
            "total_amount": round(item_total, 2),
        })

    grand_total = round(subtotal - total_discount, 2)

    new_payment_mode = invoice_update.payment_mode or invoice.payment_mode
    if invoice_update.paid_amount is not None:
        paid_amount = invoice_update.paid_amount
    elif new_payment_mode in ["CASH", "UPI"]:
        paid_amount = grand_total
    elif new_payment_mode == "UDHAR_CREDIT":
        paid_amount = 0.0
    else:
        paid_amount = invoice.paid_amount

    balance_amount = max(0.0, round(grand_total - paid_amount, 2))

    if balance_amount == 0.0:
        payment_status = "PAID"
    elif paid_amount > 0.0:
        payment_status = "PARTIAL"
    else:
        payment_status = "UNPAID"

    new_shop_id = invoice_update.shop_id if invoice_update.shop_id is not None else invoice.shop_id

    invoice.customer_name = invoice_update.customer_name or invoice.customer_name
    invoice.customer_phone = invoice_update.customer_phone if invoice_update.customer_phone is not None else invoice.customer_phone
    invoice.shop_id = new_shop_id
    invoice.payment_mode = new_payment_mode
    invoice.payment_status = payment_status
    invoice.notes = invoice_update.notes if invoice_update.notes is not None else invoice.notes
    invoice.subtotal = round(subtotal, 2)
    invoice.discount_amount = round(total_discount, 2)
    invoice.tax_amount = 0.0
    invoice.total_amount = grand_total
    invoice.paid_amount = paid_amount
    invoice.balance_amount = balance_amount

    # Delete old items and insert updated items
    for old_item in list(invoice.items):
        db.delete(old_item)
    db.flush()

    for item_data in processed_new_items:
        db.add(InvoiceItem(invoice_id=invoice.id, **item_data))

    # Apply new balance to shop if applicable
    if new_shop_id and balance_amount > 0:
        new_shop = db.query(Shop).filter(
            Shop.id == new_shop_id,
            Shop.user_id == user_id
        ).with_for_update().first()
        if new_shop:
            new_shop.current_balance += balance_amount

    # Reconcile ledger
    db.query(LedgerEntry).filter(
        LedgerEntry.reference_id == invoice.invoice_number,
        LedgerEntry.user_id == user_id
    ).delete(synchronize_session=False)

    revenue_entry = LedgerEntry(
        user_id=user_id,
        entry_number=generate_entry_number(db, offset=0, user_id=user_id),
        transaction_date=datetime.utcnow(),
        reference_type="SALE_INVOICE",
        reference_id=invoice.invoice_number,
        shop_id=invoice.shop_id,
        account_type="REVENUE",
        description=f"Updated Invoice {invoice.invoice_number} - {invoice.customer_name}",
        credit_amount=grand_total,
        debit_amount=0.0,
        running_balance=0.0,
        payment_mode=invoice.payment_mode
    )
    db.add(revenue_entry)

    if paid_amount > 0:
        acc = "CASH" if invoice.payment_mode == "CASH" else "BANK"
        db.add(LedgerEntry(
            user_id=user_id,
            entry_number=generate_entry_number(db, offset=1, user_id=user_id),
            transaction_date=datetime.utcnow(),
            reference_type="SALE_INVOICE",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type=acc,
            description=f"Payment on {invoice.invoice_number}",
            debit_amount=paid_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode=invoice.payment_mode
        ))

    if balance_amount > 0:
        db.add(LedgerEntry(
            user_id=user_id,
            entry_number=generate_entry_number(db, offset=2, user_id=user_id),
            transaction_date=datetime.utcnow(),
            reference_type="SALE_INVOICE",
            reference_id=invoice.invoice_number,
            shop_id=invoice.shop_id,
            account_type="ACCOUNTS_RECEIVABLE",
            description=f"Udhar on {invoice.invoice_number}",
            debit_amount=balance_amount,
            credit_amount=0.0,
            running_balance=0.0,
            payment_mode="UDHAR_CREDIT"
        ))

    db.commit()
    db.refresh(invoice)
    return invoice

def delete_sale_invoice(db: Session, invoice_id: int, user_id: int = 1) -> dict:
    invoice = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.user_id == user_id
    ).with_for_update().first()
    if not invoice:
        raise HTTPException(status_code=404, detail=f"Invoice with ID {invoice_id} not found.")

    invoice_number = invoice.invoice_number

    # 1. Restore product stock
    for item in list(invoice.items):
        prod = db.query(Product).filter(
            Product.id == item.product_id,
            Product.user_id == user_id
        ).with_for_update().first()
        if prod:
            prod.stock_qty += item.quantity
        db.delete(item)

    # 2. Revert shop Udhar balance
    if invoice.shop_id and invoice.balance_amount > 0:
        shop = db.query(Shop).filter(
            Shop.id == invoice.shop_id,
            Shop.user_id == user_id
        ).with_for_update().first()
        if shop:
            shop.current_balance = max(0.0, shop.current_balance - invoice.balance_amount)

    # 3. Clean up double-entry ledger records
    db.query(LedgerEntry).filter(
        LedgerEntry.reference_id == invoice.invoice_number,
        LedgerEntry.user_id == user_id
    ).delete(synchronize_session=False)

    # 4. Delete invoice
    db.delete(invoice)
    db.commit()

    return {
        "success": True,
        "message": f"Invoice {invoice_number} successfully deleted. Inventory and balances restored.",
        "invoice_id": invoice_id,
        "invoice_number": invoice_number
    }
