from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    EXECUTOR = "executor"
    ADMIN = "admin"
    PROVIDER = "provider"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    rating: float = 0.0
    balance: float = 0.0
    is_active: bool = True
    created_at: datetime
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[UserRole] = None  # Используем Enum
    password: Optional[str] = None
    avatar_url: Optional[str] = None
    description: Optional[str] = None

class UserDescriptionUpdate(BaseModel):
    description: str