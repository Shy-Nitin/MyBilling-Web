from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
