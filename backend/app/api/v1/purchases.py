from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.app.core.database import get_db
from backend.app.models.purchase import PurchaseOrder, PurchaseItem
from backend.app.models.supplier import Supplier
from backend.app.models.product import Product
from backend.app.models.ledger import LedgerEntry
from backend.app.models.user import User
from backend.app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from backend.app.schemas.purchase import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse, PurchaseItemResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

class SupplierPaymentRequest(BaseModel):
    supplier_id: int
    amount: float
    payment_mode: str = "BANK" # BANK, CASH, CHEQUE
    notes: Optional[str] = None

def _enrich_po(po: PurchaseOrder, db: Session, user_id: int) -> PurchaseOrderResponse:
    supplier = db.query(Supplier).filter(Supplier.id == po.supplier_id, Supplier.user_id == user_id).first()
    supplier_name = supplier.name if supplier else "Unknown Supplier"
    
    items = []
    for it in po.items:
        items.append(PurchaseItemResponse(
            id=it.id,
            purchase_id=it.purchase_id,
            product_id=it.product_id,
            sku=it.sku,
            product_name=it.product_name,
            quantity=it.quantity,
            unit_cost=it.unit_cost,
            tax_rate=it.tax_rate,
            total_amount=it.total_amount
        ))

    return PurchaseOrderResponse(
        id=po.id,
        po_number=po.po_number,
        supplier_id=po.supplier_id,
        supplier_name=supplier_name,
        vendor_invoice_no=po.vendor_invoice_no,
        order_date=po.order_date,
        received_date=po.received_date,
        subtotal=po.subtotal,
        tax_amount=po.tax_amount,
        total_amount=po.total_amount,
        paid_amount=po.paid_amount,
        balance_amount=po.balance_amount,
        status=po.status,
        notes=po.notes,
        created_at=po.created_at,
        items=items
    )

# ==========================================
# SUPPLIERS CRUD
# ==========================================

@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Supplier).filter(Supplier.user_id == current_user.id)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Supplier.name.ilike(pattern)) | (Supplier.contact_person.ilike(pattern)) | (Supplier.phone.ilike(pattern)))
    if status and status.upper() != "ALL":
        query = query.filter(Supplier.status == status)
    return query.order_by(Supplier.outstanding_balance.desc(), Supplier.name.asc()).all()

@router.post("/suppliers", response_model=SupplierResponse)
def add_supplier(
    supplier_in: SupplierCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplier = Supplier(**supplier_in.model_dump(), user_id=current_user.id)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
def get_supplier_by_id(
    supplier_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    return supplier

@router.put("/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_in: SupplierUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    update_data = supplier_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id, Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    has_po = db.query(PurchaseOrder).filter(PurchaseOrder.supplier_id == supplier_id, PurchaseOrder.user_id == current_user.id).first()
    if has_po:
        supplier.status = "Archived"
        db.commit()
        return {
            "success": True,
            "action": "archived",
            "message": f"Supplier '{supplier.name}' has purchase orders and cannot be permanently deleted. Its status has been marked as 'Archived'.",
            "supplier_id": supplier_id
        }

    supplier_name = supplier.name
    db.delete(supplier)
    db.commit()
    return {"message": f"Supplier {supplier_name} deleted."}

# ==========================================
# PURCHASE ORDERS CRUD
# ==========================================

@router.get("", response_model=List[PurchaseOrderResponse])
def list_purchases(
    supplier_id: Optional[int] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PurchaseOrder).filter(PurchaseOrder.user_id == current_user.id)
    if supplier_id:
        query = query.filter(PurchaseOrder.supplier_id == supplier_id)
    if status and status.upper() != "ALL":
        query = query.filter(PurchaseOrder.status == status)
    pos = query.order_by(PurchaseOrder.order_date.desc()).all()
    return [_enrich_po(po, db, current_user.id) for po in pos]

@router.post("", response_model=PurchaseOrderResponse)
def create_purchase_order(
    po_in: PurchaseOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not po_in.items:
        raise HTTPException(status_code=400, detail="Purchase order must contain at least one line item.")

    supplier = db.query(Supplier).filter(Supplier.id == po_in.supplier_id, Supplier.user_id == current_user.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    po_count = db.query(PurchaseOrder).filter(PurchaseOrder.user_id == current_user.id).count() + 1
    po_number = f"PO-{datetime.utcnow().strftime('%Y%m')}-{po_count:04d}"

    subtotal = 0.0
    total_tax = 0.0
    items_to_create = []

    for item_in in po_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id, Product.user_id == current_user.id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with ID {item_in.product_id} not found.")

        # Update product stock & landed cost
        product.stock_qty += item_in.quantity
        if item_in.unit_cost > 0:
            product.landed_cost = item_in.unit_cost

        item_sub = item_in.quantity * item_in.unit_cost
        item_tax = item_sub * (item_in.tax_rate / 100.0)
        item_tot = item_sub + item_tax

        subtotal += item_sub
        total_tax += item_tax

        items_to_create.append({
            "product_id": product.id,
            "sku": product.sku,
            "product_name": product.name,
            "quantity": item_in.quantity,
            "unit_cost": item_in.unit_cost,
            "tax_rate": item_in.tax_rate,
            "total_amount": round(item_tot, 2)
        })

    grand_total = round(subtotal + total_tax, 2)
    paid_amt = po_in.paid_amount or 0.0
    balance_amount = max(0.0, round(grand_total - paid_amt, 2))

    po = PurchaseOrder(
        user_id=current_user.id,
        po_number=po_number,
        supplier_id=supplier.id,
        vendor_invoice_no=po_in.vendor_invoice_no,
        order_date=po_in.order_date or datetime.utcnow(),
        received_date=datetime.utcnow(),
        subtotal=round(subtotal, 2),
        tax_amount=round(total_tax, 2),
        total_amount=grand_total,
        paid_amount=paid_amt,
        balance_amount=balance_amount,
        status="RECEIVED",
        notes=po_in.notes,
        created_at=datetime.utcnow()
    )
    db.add(po)
    db.flush()

    for it_dict in items_to_create:
        db.add(PurchaseItem(purchase_id=po.id, **it_dict))

    # Increment supplier payable balance
    supplier.outstanding_balance += balance_amount

    # Create double-entry ledger record
    entry_count = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id).count() + 1
    ledger_entry = LedgerEntry(
        user_id=current_user.id,
        entry_number=f"GRN-{datetime.utcnow().strftime('%Y%m')}-{entry_count:05d}",
        transaction_date=datetime.utcnow(),
        reference_type="PURCHASE_GRN",
        reference_id=po.po_number,
        supplier_id=supplier.id,
        account_type="ACCOUNTS_PAYABLE",
        description=f"Purchase GRN {po.po_number} from {supplier.name}",
        debit_amount=0.0,
        credit_amount=grand_total,
        running_balance=supplier.outstanding_balance,
        payment_mode="CREDIT"
    )
    db.add(ledger_entry)

    db.commit()
    db.refresh(po)
    return _enrich_po(po, db, current_user.id)

@router.get("/{purchase_id}", response_model=PurchaseOrderResponse)
def get_purchase_by_id(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_id, PurchaseOrder.user_id == current_user.id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found.")
    return _enrich_po(po, db, current_user.id)

@router.delete("/{purchase_id}")
def delete_purchase_order(
    purchase_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_id, PurchaseOrder.user_id == current_user.id).with_for_update().first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found.")

    po_number = po.po_number

    # Reconcile inventory
    for item in list(po.items):
        prod = db.query(Product).filter(Product.id == item.product_id, Product.user_id == current_user.id).with_for_update().first()
        if prod:
            prod.stock_qty = max(0.0, prod.stock_qty - item.quantity)
        db.delete(item)

    # Revert supplier payable balance
    supplier = db.query(Supplier).filter(Supplier.id == po.supplier_id, Supplier.user_id == current_user.id).with_for_update().first()
    if supplier and po.balance_amount > 0:
        supplier.outstanding_balance = max(0.0, supplier.outstanding_balance - po.balance_amount)

    # Clean up ledger records
    db.query(LedgerEntry).filter(LedgerEntry.reference_id == po_number, LedgerEntry.user_id == current_user.id).delete(synchronize_session=False)

    db.delete(po)
    db.commit()

    return {
        "success": True,
        "message": f"Purchase order {po_number} deleted. Stock decremented and supplier balance reconciled.",
        "purchase_id": purchase_id,
        "po_number": po_number
    }

@router.post("/pay-supplier")
def pay_supplier(
    req: SupplierPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplier = db.query(Supplier).filter(Supplier.id == req.supplier_id, Supplier.user_id == current_user.id).with_for_update().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0.")

    supplier.outstanding_balance = max(0.0, supplier.outstanding_balance - req.amount)

    entry_count = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id).count() + 1
    ledger_entry = LedgerEntry(
        user_id=current_user.id,
        entry_number=f"VOU-{datetime.utcnow().strftime('%Y%m')}-{entry_count:05d}",
        transaction_date=datetime.utcnow(),
        reference_type="SUPPLIER_PAYMENT",
        reference_id=f"SUPP-{supplier.id}",
        supplier_id=supplier.id,
        account_type="BANK" if req.payment_mode == "BANK" else "CASH",
        description=f"Disbursement to {supplier.name} - {req.notes or 'Settlement'}",
        debit_amount=0.0,
        credit_amount=req.amount,
        running_balance=supplier.outstanding_balance,
        payment_mode=req.payment_mode
    )
    db.add(ledger_entry)

    db.commit()
    db.refresh(supplier)
    return {
        "message": f"Disbursed ₹{req.amount:,.2f} to {supplier.name}.",
        "new_balance": supplier.outstanding_balance
    }
