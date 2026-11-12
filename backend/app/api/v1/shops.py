from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from backend.app.core.database import get_db
from backend.app.models.shop import Shop
from backend.app.models.route import Route
from backend.app.models.invoice import Invoice
from backend.app.models.ledger import LedgerEntry
from backend.app.schemas.shop import ShopCreate, ShopUpdate, ShopResponse

router = APIRouter()

class CollectPaymentRequest(BaseModel):
    amount: float
    payment_mode: str = "CASH" # CASH, UPI, BANK
    notes: Optional[str] = None

def _enrich_shop_response(shop: Shop, db: Session) -> ShopResponse:
    route_name = None
    if shop.route_id:
        rt = db.query(Route).filter(Route.id == shop.route_id).first()
        if rt:
            route_name = rt.name

    inv_stats = db.query(
        func.count(Invoice.id).label("count"),
        func.coalesce(func.sum(Invoice.total_amount), 0.0).label("total")
    ).filter(Invoice.shop_id == shop.id).first()

    return ShopResponse(
        id=shop.id,
        name=shop.name,
        owner_name=shop.owner_name,
        phone=shop.phone,
        gstin=shop.gstin,
        address=shop.address,
        area=shop.area,
        route_id=shop.route_id,
        route_name=route_name,
        credit_limit=shop.credit_limit,
        current_balance=shop.current_balance,
        tier=shop.tier,
        status=shop.status,
        created_at=shop.created_at,
        updated_at=shop.updated_at,
        total_invoices=inv_stats.count if inv_stats else 0,
        total_billed=float(inv_stats.total) if inv_stats else 0.0
    )

@router.get("", response_model=List[ShopResponse])
def list_shops(
    search: Optional[str] = None,
    route_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Shop)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Shop.name.ilike(pattern)) | (Shop.owner_name.ilike(pattern)) | (Shop.phone.ilike(pattern)))
    if route_id is not None:
        query = query.filter(Shop.route_id == route_id)
    if status and status.upper() != "ALL":
        query = query.filter(Shop.status == status)

    shops = query.order_by(Shop.current_balance.desc(), Shop.name.asc()).all()
    return [_enrich_shop_response(s, db) for s in shops]

@router.post("", response_model=ShopResponse)
def create_shop(shop_in: ShopCreate, db: Session = Depends(get_db)):
    shop = Shop(**shop_in.model_dump())
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return _enrich_shop_response(shop, db)

@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(shop_id: int, db: Session = Depends(get_db)):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    return _enrich_shop_response(shop, db)

@router.put("/{shop_id}", response_model=ShopResponse)
def update_shop(shop_id: int, shop_in: ShopUpdate, db: Session = Depends(get_db)):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    
    update_data = shop_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(shop, field, value)
    
    db.commit()
    db.refresh(shop)
    return _enrich_shop_response(shop, db)

@router.delete("/{shop_id}")
def delete_shop(shop_id: int, db: Session = Depends(get_db)):
    shop = db.query(Shop).filter(Shop.id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")

    # Check for historical invoices
    has_invoices = db.query(Invoice).filter(Invoice.shop_id == shop_id).first()
    if has_invoices:
        shop.status = "Archived"
        db.commit()
        return {
            "success": True,
            "action": "archived",
            "message": f"Shop '{shop.name}' has historical sales invoices and cannot be permanently deleted. Its status has been marked as 'Archived'.",
            "shop_id": shop_id
        }
    
    shop_name = shop.name
    db.delete(shop)
    db.commit()
    return {
        "success": True,
        "action": "deleted",
        "message": f"Shop '{shop_name}' was permanently deleted.",
        "shop_id": shop_id
    }

@router.post("/{shop_id}/collect-payment")
def collect_shop_payment(shop_id: int, req: CollectPaymentRequest, db: Session = Depends(get_db)):
    shop = db.query(Shop).filter(Shop.id == shop_id).with_for_update().first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0.")

    # Deduct from Udhar balance
    shop.current_balance = max(0.0, shop.current_balance - req.amount)

    # Add ledger transaction
    entry_count = db.query(LedgerEntry).count() + 1
    ledger_entry = LedgerEntry(
        entry_number=f"RCT-{datetime.utcnow().strftime('%Y%m')}-{entry_count:05d}",
        transaction_date=datetime.utcnow(),
        reference_type="PAYMENT_RECEIVED",
        reference_id=f"SHOP-{shop.id}",
        shop_id=shop.id,
        account_type="CASH" if req.payment_mode == "CASH" else "BANK",
        description=f"Udhar Recovery from {shop.name} - {req.notes or 'Settlement'}",
        debit_amount=req.amount,
        credit_amount=0.0,
        running_balance=shop.current_balance,
        payment_mode=req.payment_mode
    )
    db.add(ledger_entry)

    db.commit()
    db.refresh(shop)
    return {
        "message": f"Successfully received ₹{req.amount:,.2f} from {shop.name}.",
        "new_balance": shop.current_balance
    }
