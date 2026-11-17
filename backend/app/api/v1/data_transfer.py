import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.product import Product
from backend.app.models.shop import Shop
from backend.app.models.category import Category
from backend.app.models.user import User
from backend.app.api.deps import get_current_user

router = APIRouter()

# ==========================================
# SELECTIVE JSON EXPORT (MOBILE COMPATIBLE)
# ==========================================

@router.get("/export-json")
def export_mobile_data(
    include_products: bool = True,
    include_shops: bool = True,
    include_categories: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exports clean, mobile-compatible catalog and outlet data in JSON format for the tenant.
    Excludes sensitive invoices, profit numbers, and internal ledgers.
    """
    export_payload: Dict[str, Any] = {
        "version": "1.0",
        "app": "MyBilling Web Admin",
        "user_email": current_user.email,
        "exported_at": datetime.utcnow().isoformat(),
        "exported_date": datetime.utcnow().strftime("%Y-%m-%d"),
    }

    if include_categories:
        categories = db.query(Category).filter(Category.user_id == current_user.id).all()
        export_payload["categories"] = [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "is_active": c.is_active
            }
            for c in categories
        ]

    if include_shops:
        shops = db.query(Shop).filter(Shop.user_id == current_user.id, Shop.status != "Archived").all()
        export_payload["shops"] = [
            {
                "id": s.id,
                "name": s.name,
                "owner_name": s.owner_name,
                "phone": s.phone,
                "gstin": s.gstin,
                "address": s.address,
                "area": s.area,
                "credit_limit": s.credit_limit,
                "tier": s.tier,
                "status": s.status
            }
            for s in shops
        ]

    if include_products:
        products = db.query(Product).filter(Product.user_id == current_user.id, Product.is_active == True).all()
        export_payload["products"] = [
            {
                "id": p.id,
                "sku": p.sku,
                "barcode": p.barcode,
                "name": p.name,
                "brand": p.brand,
                "category": p.category,
                "pack_size": p.pack_size,
                "wholesale_rate": p.wholesale_rate,
                "mrp": p.mrp,
                "stock_qty": p.stock_qty,
                "unit": p.unit or "PCS",
                "min_stock_threshold": p.min_stock_threshold,
                "is_active": p.is_active
            }
            for p in products
        ]

    filename = f"mybilling-export-{datetime.utcnow().strftime('%Y-%m-%d')}.json"
    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ==========================================
# IMPORT MAPPING & VALIDATION HELPERS
# ==========================================

def _normalize_category_item(raw: Dict[str, Any]) -> Dict[str, Any]:
    name = raw.get("name") or raw.get("category_name") or raw.get("title") or ""
    return {
        "name": str(name).strip(),
        "description": raw.get("description") or f"{name} Category",
        "is_active": raw.get("is_active", True)
    }

def _normalize_shop_item(raw: Dict[str, Any]) -> Dict[str, Any]:
    name = raw.get("name") or raw.get("shop_name") or raw.get("outlet_name") or raw.get("store_name") or ""
    owner = raw.get("owner_name") or raw.get("owner") or raw.get("contact_person") or ""
    phone = raw.get("phone") or raw.get("mobile") or raw.get("contact_number") or ""
    return {
        "name": str(name).strip(),
        "owner_name": str(owner).strip() if owner else None,
        "phone": str(phone).strip() if phone else None,
        "gstin": raw.get("gstin") or raw.get("gst_number"),
        "address": raw.get("address"),
        "area": raw.get("area") or raw.get("locality"),
        "credit_limit": float(raw.get("credit_limit") or raw.get("udhar_limit") or 50000.0),
        "tier": raw.get("tier") or "Standard",
        "status": raw.get("status") or "Active"
    }

def _normalize_product_item(raw: Dict[str, Any]) -> Dict[str, Any]:
    name = raw.get("name") or raw.get("product_name") or raw.get("title") or ""
    sku = raw.get("sku") or raw.get("code") or raw.get("product_code") or ""
    rate = float(raw.get("wholesale_rate") or raw.get("rate") or raw.get("price") or raw.get("selling_price") or 0.0)
    cost = float(raw.get("landed_cost") or raw.get("purchase_rate") or raw.get("cost") or 0.0)
    mrp = float(raw.get("mrp") or raw.get("max_retail_price") or (rate * 1.15))
    stock = float(raw.get("stock_qty") or raw.get("stock") or raw.get("quantity") or raw.get("opening_stock") or 0.0)

    return {
        "sku": str(sku).strip().upper() if sku else None,
        "barcode": str(raw.get("barcode") or "").strip() or None,
        "name": str(name).strip(),
        "brand": str(raw.get("brand") or "Generic").strip(),
        "category": str(raw.get("category") or "General").strip(),
        "pack_size": str(raw.get("pack_size") or "1 unit").strip(),
        "landed_cost": round(cost, 2),
        "wholesale_rate": round(rate, 2),
        "mrp": round(mrp, 2),
        "stock_qty": round(stock, 2),
        "min_stock_threshold": float(raw.get("min_stock_threshold") or 10.0),
        "unit": str(raw.get("unit") or "PCS").strip().upper(),
        "is_active": bool(raw.get("is_active", True))
    }

# ==========================================
# IMPORT ENDPOINTS
# ==========================================

@router.post("/preview-import")
async def preview_mobile_import(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        payload = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")

    raw_categories = payload.get("categories") or []
    raw_shops = payload.get("shops") or payload.get("outlets") or payload.get("stores") or []
    raw_products = payload.get("products") or payload.get("catalog") or payload.get("items") or []

    categories_new = 0
    categories_match = 0
    for rc in raw_categories:
        if isinstance(rc, dict):
            name = rc.get("name") or rc.get("category_name")
            if name:
                exists = db.query(Category).filter(Category.name.ilike(name.strip()), Category.user_id == current_user.id).first()
                if exists:
                    categories_match += 1
                else:
                    categories_new += 1

    shops_new = 0
    shops_match = 0
    for rs in raw_shops:
        if isinstance(rs, dict):
            name = rs.get("name") or rs.get("shop_name")
            phone = rs.get("phone") or rs.get("mobile")
            match = None
            if phone:
                match = db.query(Shop).filter(Shop.phone == str(phone).strip(), Shop.user_id == current_user.id).first()
            if not match and name:
                match = db.query(Shop).filter(Shop.name.ilike(str(name).strip()), Shop.user_id == current_user.id).first()
            if match:
                shops_match += 1
            else:
                shops_new += 1

    products_new = 0
    products_match = 0
    for rp in raw_products:
        if isinstance(rp, dict):
            sku = rp.get("sku") or rp.get("code")
            name = rp.get("name") or rp.get("product_name")
            match = None
            if sku:
                match = db.query(Product).filter(Product.sku == str(sku).strip().upper(), Product.user_id == current_user.id).first()
            if not match and name:
                match = db.query(Product).filter(Product.name.ilike(str(name).strip()), Product.user_id == current_user.id).first()
            if match:
                products_match += 1
            else:
                products_new += 1

    return {
        "status": "valid",
        "total_records": len(raw_categories) + len(raw_shops) + len(raw_products),
        "breakdown": {
            "categories": {"total": len(raw_categories), "new": categories_new, "existing": categories_match},
            "shops": {"total": len(raw_shops), "new": shops_new, "existing": shops_match},
            "products": {"total": len(raw_products), "new": products_new, "existing": products_match},
        }
    }

@router.post("/execute-import")
async def execute_mobile_import(
    file: UploadFile = File(...),
    update_existing: bool = Body(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        payload = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")

    raw_categories = payload.get("categories") or []
    raw_shops = payload.get("shops") or payload.get("outlets") or payload.get("stores") or []
    raw_products = payload.get("products") or payload.get("catalog") or payload.get("items") or []

    categories_added = 0
    categories_updated = 0
    shops_added = 0
    shops_updated = 0
    products_added = 0
    products_updated = 0

    try:
        # 1. Import Categories
        for rc in raw_categories:
            if isinstance(rc, dict):
                norm = _normalize_category_item(rc)
                if not norm["name"]:
                    continue
                cat = db.query(Category).filter(Category.name.ilike(norm["name"]), Category.user_id == current_user.id).first()
                if cat:
                    if update_existing:
                        if norm.get("description"):
                            cat.description = norm["description"]
                        categories_updated += 1
                else:
                    new_cat = Category(**norm, user_id=current_user.id)
                    db.add(new_cat)
                    categories_added += 1

        db.flush()

        # 2. Import Shops
        for rs in raw_shops:
            if isinstance(rs, dict):
                norm = _normalize_shop_item(rs)
                if not norm["name"]:
                    continue
                shop = None
                if norm.get("phone"):
                    shop = db.query(Shop).filter(Shop.phone == norm["phone"], Shop.user_id == current_user.id).first()
                if not shop:
                    shop = db.query(Shop).filter(Shop.name.ilike(norm["name"]), Shop.user_id == current_user.id).first()

                if shop:
                    if update_existing:
                        for k, v in norm.items():
                            if v is not None and k not in ["current_balance"]:
                                setattr(shop, k, v)
                        shops_updated += 1
                else:
                    new_shop = Shop(**norm, user_id=current_user.id)
                    db.add(new_shop)
                    shops_added += 1

        db.flush()

        # 3. Import Products
        for rp in raw_products:
            if isinstance(rp, dict):
                norm = _normalize_product_item(rp)
                if not norm["name"]:
                    continue

                prod = None
                if norm.get("sku"):
                    prod = db.query(Product).filter(Product.sku == norm["sku"], Product.user_id == current_user.id).first()
                if not prod and norm.get("barcode"):
                    prod = db.query(Product).filter(Product.barcode == norm["barcode"], Product.user_id == current_user.id).first()
                if not prod:
                    prod = db.query(Product).filter(Product.name.ilike(norm["name"]), Product.user_id == current_user.id).first()

                # Ensure category exists
                if norm.get("category"):
                    c_exists = db.query(Category).filter(Category.name.ilike(norm["category"]), Category.user_id == current_user.id).first()
                    if not c_exists:
                        db.add(Category(name=norm["category"], description="Auto-created during import", user_id=current_user.id))
                        db.flush()

                if prod:
                    if update_existing:
                        for k, v in norm.items():
                            if k == "stock_qty":
                                if prod.stock_qty == 0 and v > 0:
                                    prod.stock_qty = v
                            elif v is not None and k != "id":
                                setattr(prod, k, v)
                        products_updated += 1
                else:
                    if not norm.get("sku"):
                        p_count = db.query(Product).filter(Product.user_id == current_user.id).count() + 1
                        norm["sku"] = f"SKU-IMP-{p_count:04d}"
                    new_prod = Product(**norm, user_id=current_user.id)
                    db.add(new_prod)
                    products_added += 1

        db.commit()

        return {
            "success": True,
            "message": "Data imported successfully without affecting invoices or financial history.",
            "imported": {
                "categories": {"added": categories_added, "updated": categories_updated},
                "shops": {"added": shops_added, "updated": shops_updated},
                "products": {"added": products_added, "updated": products_updated},
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database import failed: {str(e)}")
