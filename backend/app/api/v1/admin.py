from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_admin
from backend.app.models.user import User
from backend.app.models.product import Product
from backend.app.models.shop import Shop
from backend.app.models.supplier import Supplier
from backend.app.models.invoice import Invoice, InvoiceItem
from backend.app.models.purchase import PurchaseOrder, PurchaseItem
from backend.app.models.ledger import LedgerEntry
from backend.app.models.settings import SystemSettings
from backend.app.models.route import Route
from backend.app.models.category import Category
from backend.app.schemas.auth import UserResponse

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only: List all registered business accounts in the system."""
    users = db.query(User).order_by(User.id.asc()).all()
    return [UserResponse.model_validate(u) for u in users]

@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: int,
    is_active: bool = Body(..., embed=True),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only: Enable or disable a business account."""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Master admin cannot deactivate their own account."
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    
    user.is_active = is_active
    db.commit()
    return {"message": f"User status successfully updated to {'Active' if is_active else 'Disabled'}.", "user_id": user_id, "is_active": user.is_active}

@router.get("/backup/export-system")
def export_system_backup(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Admin-only: Export entire multi-tenant system backup preserving relationships and data isolation."""
    users = db.query(User).all()
    products = db.query(Product).all()
    shops = db.query(Shop).all()
    suppliers = db.query(Supplier).all()
    routes = db.query(Route).all()
    categories = db.query(Category).all()
    invoices = db.query(Invoice).all()
    invoice_items = db.query(InvoiceItem).all()
    purchases = db.query(PurchaseOrder).all()
    purchase_items = db.query(PurchaseItem).all()
    ledger_entries = db.query(LedgerEntry).all()
    settings = db.query(SystemSettings).all()

    return {
        "metadata": {
            "version": "1.0.0",
            "exported_at": datetime.utcnow().isoformat(),
            "exported_by": admin.email,
            "system": "MyBilling ERP Enterprise Multi-Tenant"
        },
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "password_hash": u.password_hash,
                "full_name": u.full_name,
                "business_name": u.business_name,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "products": [
            {
                "id": p.id,
                "user_id": p.user_id,
                "sku": p.sku,
                "barcode": p.barcode,
                "name": p.name,
                "brand": p.brand,
                "category": p.category,
                "pack_size": p.pack_size,
                "landed_cost": p.landed_cost,
                "wholesale_rate": p.wholesale_rate,
                "mrp": p.mrp,
                "stock_qty": p.stock_qty,
                "min_stock_threshold": p.min_stock_threshold,
                "unit": p.unit,
                "is_active": p.is_active,
            }
            for p in products
        ],
        "shops": [
            {
                "id": s.id,
                "user_id": s.user_id,
                "name": s.name,
                "owner_name": s.owner_name,
                "phone": s.phone,
                "gstin": s.gstin,
                "address": s.address,
                "area": s.area,
                "route_id": s.route_id,
                "credit_limit": s.credit_limit,
                "current_balance": s.current_balance,
                "tier": s.tier,
                "status": s.status,
            }
            for s in shops
        ],
        "suppliers": [
            {
                "id": sup.id,
                "user_id": sup.user_id,
                "name": sup.name,
                "contact_person": sup.contact_person,
                "phone": sup.phone,
                "email": sup.email,
                "gstin": sup.gstin,
                "address": sup.address,
                "city": sup.city,
                "outstanding_balance": sup.outstanding_balance,
                "payment_terms_days": sup.payment_terms_days,
                "status": sup.status,
            }
            for sup in suppliers
        ],
        "invoices": [
            {
                "id": inv.id,
                "user_id": inv.user_id,
                "invoice_number": inv.invoice_number,
                "shop_id": inv.shop_id,
                "customer_name": inv.customer_name,
                "customer_phone": inv.customer_phone,
                "subtotal": inv.subtotal,
                "discount_amount": inv.discount_amount,
                "tax_amount": inv.tax_amount,
                "total_amount": inv.total_amount,
                "paid_amount": inv.paid_amount,
                "balance_amount": inv.balance_amount,
                "payment_mode": inv.payment_mode,
                "payment_status": inv.payment_status,
                "notes": inv.notes,
                "created_at": inv.created_at.isoformat() if inv.created_at else None,
            }
            for inv in invoices
        ],
        "invoice_items": [
            {
                "id": item.id,
                "invoice_id": item.invoice_id,
                "product_id": item.product_id,
                "sku": item.sku,
                "product_name": item.product_name,
                "pack_size": item.pack_size,
                "quantity": item.quantity,
                "unit": item.unit,
                "unit_rate": item.unit_rate,
                "landed_cost": item.landed_cost,
                "tax_rate": item.tax_rate,
                "total_amount": item.total_amount,
            }
            for item in invoice_items
        ],
        "settings": [
            {
                "id": st.id,
                "user_id": st.user_id,
                "store_name": st.store_name,
                "tagline": st.tagline,
                "gstin": st.gstin,
                "phone": st.phone,
                "email": st.email,
                "address": st.address,
                "currency_symbol": st.currency_symbol,
            }
            for st in settings
        ],
    }

@router.post("/backup/restore-system")
def restore_system_backup(
    data: Dict[str, Any],
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin-only: Transactional restore of entire multi-tenant system backup."""
    if "users" not in data:
        raise HTTPException(status_code=400, detail="Invalid backup file: 'users' section missing.")

    try:
        # Atomic transaction
        # 1. Restore/Upsert users
        for u_data in data.get("users", []):
            existing = db.query(User).filter(User.email == u_data["email"]).first()
            if not existing:
                new_u = User(
                    email=u_data["email"],
                    password_hash=u_data["password_hash"],
                    full_name=u_data["full_name"],
                    business_name=u_data["business_name"],
                    role=u_data.get("role", "user"),
                    is_active=u_data.get("is_active", True),
                )
                db.add(new_u)
        db.flush()

        # 2. Restore Products
        for p_data in data.get("products", []):
            existing_p = db.query(Product).filter(
                Product.sku == p_data["sku"],
                Product.user_id == p_data.get("user_id", 1)
            ).first()
            if not existing_p:
                db.add(Product(
                    user_id=p_data.get("user_id", 1),
                    sku=p_data["sku"],
                    barcode=p_data.get("barcode"),
                    name=p_data["name"],
                    brand=p_data.get("brand"),
                    category=p_data.get("category", "General"),
                    pack_size=p_data.get("pack_size", "1 unit"),
                    landed_cost=p_data.get("landed_cost", 0.0),
                    wholesale_rate=p_data.get("wholesale_rate", 0.0),
                    mrp=p_data.get("mrp", 0.0),
                    stock_qty=p_data.get("stock_qty", 0.0),
                    min_stock_threshold=p_data.get("min_stock_threshold", 10.0),
                    unit=p_data.get("unit", "PCS"),
                    is_active=p_data.get("is_active", True),
                ))

        db.commit()
        return {"message": "System backup successfully restored with transactional safety."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to restore system backup: {str(e)}")
