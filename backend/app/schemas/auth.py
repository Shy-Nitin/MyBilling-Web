from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    business_name: str = Field(..., min_length=2, max_length=200)
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: str = Field(..., pattern=EMAIL_REGEX)
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    business_name: str
    role: str
    is_active: bool
    supabase_uid: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
