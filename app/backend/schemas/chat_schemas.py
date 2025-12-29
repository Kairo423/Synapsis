from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaskMessageCreate(BaseModel):
    content: str


class TaskMessageRead(BaseModel):
    id: int
    task_id: int
    sender_id: int
    sender_name: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
