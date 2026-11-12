from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RouteBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class RouteResponse(RouteBase):
    id: int
    created_at: Optional[datetime] = None
    shop_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
