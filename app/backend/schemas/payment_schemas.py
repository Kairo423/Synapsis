from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PaymentHistoryItem(BaseModel):
    response_id: int
    contract_id: Optional[int] = None
    task_id: int
    task_title: str
    amount: float
    direction: str
    counterparty_id: int
    counterparty_name: Optional[str] = None
    occurred_at: datetime
