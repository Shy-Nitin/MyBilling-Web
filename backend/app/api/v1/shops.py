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
from backend.app.models.user import User
from backend.app.schemas.shop import ShopCreate, ShopUpdate, ShopResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

class CollectPaymentRequest(BaseModel):
    amount: float
    payment_mode: str = "CASH" # CASH, UPI, BANK
    notes: Optional[str] = None

def _enrich_shop_response(shop: Shop, db: Session, user_id: int) -> ShopResponse:
    route_name = None
    if shop.route_id:
        rt = db.query(Route).filter(Route.id == shop.route_id, Route.user_id == user_id).first()
        if rt:
            route_name = rt.name

    inv_stats = db.query(
        func.count(Invoice.id).label("count"),
        func.coalesce(func.sum(Invoice.total_amount), 0.0).label("total")
    ).filter(Invoice.shop_id == shop.id, Invoice.user_id == user_id).first()

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Shop).filter(Shop.user_id == current_user.id)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Shop.name.ilike(pattern)) | (Shop.owner_name.ilike(pattern)) | (Shop.phone.ilike(pattern)))
    if route_id is not None:
        query = query.filter(Shop.route_id == route_id)
    if status and status.upper() != "ALL":
        query = query.filter(Shop.status == status)

    shops = query.order_by(Shop.current_balance.desc(), Shop.name.asc()).all()
    return [_enrich_shop_response(s, db, current_user.id) for s in shops]

@router.post("", response_model=ShopResponse)
def create_shop(
    shop_in: ShopCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shop = Shop(**shop_in.model_dump(), user_id=current_user.id)
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return _enrich_shop_response(shop, db, current_user.id)

@router.get("/{shop_id}", response_model=ShopResponse)
def get_shop(
    shop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(
        Shop.id == shop_id,
        Shop.user_id == current_user.id
    ).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    return _enrich_shop_response(shop, db, current_user.id)

@router.put("/{shop_id}", response_model=ShopResponse)
def update_shop(
    shop_id: int,
    shop_in: ShopUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(
        Shop.id == shop_id,
        Shop.user_id == current_user.id
    ).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    
    update_data = shop_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(shop, field, value)
    
    db.commit()
    db.refresh(shop)
    return _enrich_shop_response(shop, db, current_user.id)

@router.delete("/{shop_id}")
def delete_shop(
    shop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(
        Shop.id == shop_id,
        Shop.user_id == current_user.id
    ).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")

    # Check for historical invoices
    has_invoices = db.query(Invoice).filter(
        Invoice.shop_id == shop_id,
        Invoice.user_id == current_user.id
    ).first()
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
def collect_shop_payment(
    shop_id: int,
    req: CollectPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shop = db.query(Shop).filter(
        Shop.id == shop_id,
        Shop.user_id == current_user.id
    ).with_for_update().first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found.")
    
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Payment amount must be greater than 0.")

    # Deduct from Udhar balance
    shop.current_balance = max(0.0, shop.current_balance - req.amount)

    # Add ledger transaction
    entry_count = db.query(LedgerEntry).filter(LedgerEntry.user_id == current_user.id).count() + 1
    ledger_entry = LedgerEntry(
        user_id=current_user.id,
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
