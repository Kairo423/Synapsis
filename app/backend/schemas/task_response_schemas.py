from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskResponseBase(BaseModel):
    task_id: int

class TaskResponseCreate(TaskResponseBase):
    pass

class TaskResponseUpdate(BaseModel):
    comment: str
    attachment_url: Optional[str] = None

class TaskResponseStatusUpdate(BaseModel):
    status: str

from schemas.task_schemas import TaskResponse as TaskRead
from schemas.user_schemas import UserResponse as UserRead

class TaskResponseRead(TaskResponseBase):
    id: int
    performer_id: int
    comment: Optional[str] = None
    attachment_url: Optional[str] = None
    status: str
    submitted_at: datetime
    task: Optional[TaskRead] = None
    performer: Optional[UserRead] = None

    class Config:
        from_attributes = True
