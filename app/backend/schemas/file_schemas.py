from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskAttachmentRead(BaseModel):
    id: int
    task_id: int
    file_url: str
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class TaskDeliverableRead(BaseModel):
    id: int
    task_id: int
    response_id: Optional[int] = None
    contract_id: Optional[int] = None
    uploaded_by: Optional[int] = None
    file_url: str
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
