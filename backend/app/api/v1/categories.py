from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.models.category import Category
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
def get_categories(
    active_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Category).filter(Category.user_id == current_user.id)
    if active_only:
        query = query.filter(Category.is_active == True)
    return query.order_by(Category.name.asc()).all()

@router.post("", response_model=CategoryResponse)
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clean_name = category_in.name.strip()
    existing = db.query(Category).filter(
        Category.name.ilike(clean_name),
        Category.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{clean_name}' already exists.")

    category = Category(
        user_id=current_user.id,
        name=clean_name,
        description=category_in.description,
        is_active=category_in.is_active
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_by_id(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    old_name = category.name
    update_data = category_in.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"]:
        new_name = update_data["name"].strip()
        if new_name.lower() != old_name.lower():
            dup = db.query(Category).filter(
                Category.name.ilike(new_name),
                Category.id != category_id,
                Category.user_id == current_user.id
            ).first()
            if dup:
                raise HTTPException(status_code=400, detail=f"Category '{new_name}' already exists.")
            # Also update products referencing old category name
            db.query(Product).filter(
                Product.category == old_name,
                Product.user_id == current_user.id
            ).update({"category": new_name})
            category.name = new_name

    if "description" in update_data:
        category.description = update_data["description"]
    if "is_active" in update_data:
        category.is_active = update_data["is_active"]

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    reassign_to: Optional[str] = Query("General", description="Category name to reassign products to"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    cat_name = category.name
    # Check products assigned
    assigned_count = db.query(Product).filter(
        Product.category == cat_name,
        Product.user_id == current_user.id
    ).count()
    if assigned_count > 0:
        target_name = (reassign_to or "General").strip()
        # Ensure default target exists
        target_cat = db.query(Category).filter(
            Category.name.ilike(target_name),
            Category.user_id == current_user.id
        ).first()
        if not target_cat:
            target_cat = Category(
                user_id=current_user.id,
                name=target_name,
                description="Default Category",
                is_active=True
            )
            db.add(target_cat)
            db.commit()
            db.refresh(target_cat)
        db.query(Product).filter(
            Product.category == cat_name,
            Product.user_id == current_user.id
        ).update({"category": target_name})

    db.delete(category)
    db.commit()

    return {
        "success": True,
        "message": f"Category '{cat_name}' successfully deleted. {assigned_count} products reassigned to '{reassign_to or 'General'}'.",
        "category_id": category_id
    }
