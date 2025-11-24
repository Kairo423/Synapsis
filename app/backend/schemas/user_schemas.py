from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    EXECUTOR = "executor"

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole  # Используем Enum вместо str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    rating: float = 0.0  # Добавляем значения по умолчанию
    balance: float = 0.0
    is_active: bool = True
    created_at: datetime

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