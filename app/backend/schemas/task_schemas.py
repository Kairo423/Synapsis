from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    difficulty: Optional[str] = None # low, min, pro, expert
    deadline: Optional[datetime] = None
    repeats: int = 1
    file_link: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    deadline: Optional[datetime] = None
    repeats: Optional[int] = None
    file_link: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    status: str
    customer_id: int
    performer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
