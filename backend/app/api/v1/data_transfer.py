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

router = APIRouter()

# ==========================================
# SELECTIVE JSON EXPORT (MOBILE COMPATIBLE)
# ==========================================

@router.get("/export-json")
def export_mobile_data(
    include_products: bool = True,
    include_shops: bool = True,
    include_categories: bool = True,
    db: Session = Depends(get_db)
):
    """
    Exports clean, mobile-compatible catalog and outlet data in JSON format.
    Excludes sensitive invoices, profit numbers, and internal ledgers.
    """
    export_payload: Dict[str, Any] = {
        "version": "1.0",
        "app": "Maya Billing Web Admin",
        "exported_at": datetime.utcnow().isoformat(),
        "exported_date": datetime.utcnow().strftime("%Y-%m-%d"),
    }

    if include_categories:
        categories = db.query(Category).all()
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
        shops = db.query(Shop).filter(Shop.status != "Archived").all()
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
        products = db.query(Product).filter(Product.is_active == True).all()
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

    filename = f"maya-billing-export-{datetime.utcnow().strftime('%Y-%m-%d')}.json"
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
    cost = float(raw.get("landed_cost") or raw.get("cost_price") or raw.get("purchase_rate") or (rate * 0.85))
    mrp = float(raw.get("mrp") or raw.get("maximum_retail_price") or (rate * 1.15))
    qty = float(raw.get("stock_qty") or raw.get("quantity") or raw.get("stock") or 0.0)
    
    return {
        "name": str(name).strip(),
        "sku": str(sku).strip() if sku else None,
        "barcode": str(raw.get("barcode") or "").strip() or None,
        "brand": raw.get("brand") or "General",
        "category": raw.get("category") or raw.get("category_name") or "General",
        "pack_size": raw.get("pack_size") or raw.get("size") or "1 Unit",
        "wholesale_rate": rate,
        "landed_cost": cost,
        "mrp": mrp,
        "stock_qty": qty,
        "unit": str(raw.get("unit") or "PCS").upper(),
        "min_stock_threshold": float(raw.get("min_stock_threshold") or 10.0),
        "is_active": raw.get("is_active", True)
    }

# ==========================================
# IMPORT PREVIEW & EXECUTION
# ==========================================

@router.post("/preview-import")
async def preview_mobile_import(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        content = await file.read()
        payload = json.loads(content.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file format: {str(e)}")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Import file must contain a valid JSON object.")

    # Detect collections
    raw_categories = payload.get("categories") or []
    raw_shops = payload.get("shops") or payload.get("outlets") or payload.get("stores") or []
    raw_products = payload.get("products") or payload.get("catalog") or payload.get("items") or []

    categories_preview = []
    cat_new_count = 0
    cat_existing_count = 0
    for rc in raw_categories:
        if isinstance(rc, dict):
            norm = _normalize_category_item(rc)
            if norm["name"]:
                exists = db.query(Category).filter(Category.name.ilike(norm["name"])).first() is not None
                if exists:
                    cat_existing_count += 1
                else:
                    cat_new_count += 1
                categories_preview.append({"item": norm, "status": "exists" if exists else "new"})

    shops_preview = []
    shop_new_count = 0
    shop_existing_count = 0
    for rs in raw_shops:
        if isinstance(rs, dict):
            norm = _normalize_shop_item(rs)
            if norm["name"]:
                query = db.query(Shop).filter(Shop.name.ilike(norm["name"]))
                if norm["phone"]:
                    query = db.query(Shop).filter((Shop.name.ilike(norm["name"])) | (Shop.phone == norm["phone"]))
                exists = query.first() is not None
                if exists:
                    shop_existing_count += 1
                else:
                    shop_new_count += 1
                shops_preview.append({"item": norm, "status": "exists" if exists else "new"})

    products_preview = []
    prod_new_count = 0
    prod_existing_count = 0
    for rp in raw_products:
        if isinstance(rp, dict):
            norm = _normalize_product_item(rp)
            if norm["name"]:
                # Match by SKU, barcode, or name
                exists = False
                if norm["sku"]:
                    exists = db.query(Product).filter(Product.sku == norm["sku"]).first() is not None
                if not exists and norm["barcode"]:
                    exists = db.query(Product).filter(Product.barcode == norm["barcode"]).first() is not None
                if not exists:
                    exists = db.query(Product).filter(Product.name.ilike(norm["name"])).first() is not None

                if exists:
                    prod_existing_count += 1
                else:
                    prod_new_count += 1
                products_preview.append({"item": norm, "status": "exists" if exists else "new"})

    return {
        "valid": True,
        "source_app": payload.get("app", "Maya Mobile / External"),
        "exported_at": payload.get("exported_at"),
        "summary": {
            "categories": {"total": len(categories_preview), "new": cat_new_count, "existing": cat_existing_count},
            "shops": {"total": len(shops_preview), "new": shop_new_count, "existing": shop_existing_count},
            "products": {"total": len(products_preview), "new": prod_new_count, "existing": prod_existing_count},
        },
        "preview_items": {
            "categories": categories_preview[:10],
            "shops": shops_preview[:10],
            "products": products_preview[:10],
        }
    }

@router.post("/import-json")
async def execute_mobile_import(
    file: UploadFile = File(...),
    update_existing: bool = True,
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
                cat = db.query(Category).filter(Category.name.ilike(norm["name"])).first()
                if cat:
                    if update_existing:
                        if norm.get("description"):
                            cat.description = norm["description"]
                        categories_updated += 1
                else:
                    new_cat = Category(**norm)
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
                    shop = db.query(Shop).filter(Shop.phone == norm["phone"]).first()
                if not shop:
                    shop = db.query(Shop).filter(Shop.name.ilike(norm["name"])).first()

                if shop:
                    if update_existing:
                        for k, v in norm.items():
                            if v is not None and k not in ["current_balance"]:
                                setattr(shop, k, v)
                        shops_updated += 1
                else:
                    new_shop = Shop(**norm)
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
                    prod = db.query(Product).filter(Product.sku == norm["sku"]).first()
                if not prod and norm.get("barcode"):
                    prod = db.query(Product).filter(Product.barcode == norm["barcode"]).first()
                if not prod:
                    prod = db.query(Product).filter(Product.name.ilike(norm["name"])).first()

                # Ensure category exists
                if norm.get("category"):
                    c_exists = db.query(Category).filter(Category.name.ilike(norm["category"])).first()
                    if not c_exists:
                        db.add(Category(name=norm["category"], description="Auto-created during import"))
                        db.flush()

                if prod:
                    if update_existing:
                        # Update metadata and price; preserve existing stock unless new stock is positive and current is 0
                        for k, v in norm.items():
                            if k == "stock_qty":
                                if prod.stock_qty == 0 and v > 0:
                                    prod.stock_qty = v
                            elif v is not None and k != "id":
                                setattr(prod, k, v)
                        products_updated += 1
                else:
                    if not norm.get("sku"):
                        # Auto-generate a unique SKU
                        p_count = db.query(Product).count() + 1
                        norm["sku"] = f"SKU-IMP-{p_count:04d}"
                    new_prod = Product(**norm)
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
