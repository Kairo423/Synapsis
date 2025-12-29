from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List, Optional

from schemas.contract_schemas import ContractRead


class AdminUserStatusUpdate(BaseModel):
    is_active: bool


class AdminTaskStatusUpdate(BaseModel):
    status: str


class AdminTaskRead(BaseModel):
    id: int
    title: str
    status: str
    price: float
    category: Optional[str] = None
    difficulty: Optional[str] = None
    deadline: Optional[datetime] = None
    customer_id: int
    customer_name: Optional[str] = None
    performer_id: Optional[int] = None
    performer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AdminStats(BaseModel):
    users_total: int
    users_active: int
    users_blocked: int
    users_by_role: Dict[str, int]
    tasks_total: int
    tasks_by_status: Dict[str, int]
    contracts_total: int
    contracts_by_status: Dict[str, int]
    task_responses_total: int
    payments_total: float


class AdminReportSummary(BaseModel):
    generated_at: datetime
    stats: AdminStats
    recent_tasks: List[AdminTaskRead] = []
    recent_contracts: List[ContractRead] = []
