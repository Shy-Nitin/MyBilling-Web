from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.route import Route
from backend.app.models.shop import Shop
from backend.app.schemas.route import RouteCreate, RouteUpdate, RouteResponse

router = APIRouter()

@router.get("", response_model=List[RouteResponse])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(Route).order_by(Route.name.asc()).all()
    results = []
    for r in routes:
        count = db.query(Shop).filter(Shop.route_id == r.id).count()
        resp = RouteResponse(
            id=r.id,
            name=r.name,
            code=r.code,
            description=r.description,
            is_active=r.is_active,
            created_at=r.created_at,
            shop_count=count
        )
        results.append(resp)
    return results

@router.post("", response_model=RouteResponse)
def create_route(route_in: RouteCreate, db: Session = Depends(get_db)):
    clean_name = route_in.name.strip()
    existing = db.query(Route).filter(Route.name.ilike(clean_name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Route '{clean_name}' already exists.")

    route = Route(
        name=clean_name,
        code=route_in.code,
        description=route_in.description,
        is_active=route_in.is_active
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return RouteResponse(
        id=route.id,
        name=route.name,
        code=route.code,
        description=route.description,
        is_active=route.is_active,
        created_at=route.created_at,
        shop_count=0
    )

@router.get("/{route_id}", response_model=RouteResponse)
def get_route_by_id(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")
    count = db.query(Shop).filter(Shop.route_id == route.id).count()
    return RouteResponse(
        id=route.id,
        name=route.name,
        code=route.code,
        description=route.description,
        is_active=route.is_active,
        created_at=route.created_at,
        shop_count=count
    )

@router.put("/{route_id}", response_model=RouteResponse)
def update_route(route_id: int, route_in: RouteUpdate, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")

    update_data = route_in.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"]:
        clean_name = update_data["name"].strip()
        if clean_name.lower() != route.name.lower():
            dup = db.query(Route).filter(Route.name.ilike(clean_name), Route.id != route_id).first()
            if dup:
                raise HTTPException(status_code=400, detail=f"Route '{clean_name}' already exists.")
            route.name = clean_name

    if "code" in update_data:
        route.code = update_data["code"]
    if "description" in update_data:
        route.description = update_data["description"]
    if "is_active" in update_data:
        route.is_active = update_data["is_active"]

    db.commit()
    db.refresh(route)
    count = db.query(Shop).filter(Shop.route_id == route.id).count()
    return RouteResponse(
        id=route.id,
        name=route.name,
        code=route.code,
        description=route.description,
        is_active=route.is_active,
        created_at=route.created_at,
        shop_count=count
    )

@router.delete("/{route_id}")
def delete_route(route_id: int, db: Session = Depends(get_db)):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")

    # Safely detach shops from this route without deleting the shops
    shop_count = db.query(Shop).filter(Shop.route_id == route_id).update({"route_id": None})
    route_name = route.name
    db.delete(route)
    db.commit()

    return {
        "success": True,
        "message": f"Route '{route_name}' deleted. {shop_count} shops unassigned.",
        "route_id": route_id
    }
