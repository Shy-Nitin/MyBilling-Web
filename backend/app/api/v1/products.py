from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from backend.app.services.inventory_service import get_products, get_inventory_valuation, get_stock_status
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_products(db, search=search, category=category, status=status, user_id=current_user.id)

@router.get("/valuation")
def inventory_valuation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_inventory_valuation(db, user_id=current_user.id)

@router.post("", response_model=ProductResponse)
def add_product(
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Product).filter(
        Product.sku == product_in.sku,
        Product.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product SKU {product_in.sku} already exists.")
    
    product = Product(**product_in.model_dump(), user_id=current_user.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    
    resp = ProductResponse.model_validate(product)
    resp.stock_status = get_stock_status(product.stock_qty, product.min_stock_threshold)
    return resp

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.id,
        Product.is_active == True
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    resp = ProductResponse.model_validate(product)
    resp.stock_status = get_stock_status(product.stock_qty, product.min_stock_threshold)
    return resp

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    resp = ProductResponse.model_validate(product)
    resp.stock_status = get_stock_status(product.stock_qty, product.min_stock_threshold)
    return resp

@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.user_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    product.is_active = False
    db.commit()
    return {"message": f"Product {product.sku} deactivated successfully."}
