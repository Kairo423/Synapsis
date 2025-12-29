from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ContractCreate(BaseModel):
    task_id: Optional[int] = None
    task_response_id: Optional[int] = None
    performer_id: Optional[int] = None
    agreed_price: Optional[float] = None
    status: Optional[str] = None

class ContractRead(BaseModel):
    id: int
    task_id: int
    task_response_id: Optional[int] = None
    customer_id: int
    performer_id: int
    status: str
    agreed_price: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContractStatusUpdate(BaseModel):
    status: str
