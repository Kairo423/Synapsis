from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, aliased
from typing import List, Optional

from auth import get_current_user
from database import get_db
from models.contract_models import Contract
from models.task_models import Task, TaskResponse
from models.user_models import User
from schemas.payment_schemas import PaymentHistoryItem

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("/history", response_model=List[PaymentHistoryItem])
async def list_payment_history(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = current_user
    if current_user.role == "admin":
        if user_id is None:
            raise HTTPException(status_code=400, detail="Укажите user_id для просмотра истории")
        target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")

    counterparty = aliased(User)

    if target_user.role == "executor":
        query = db.query(TaskResponse, Task, Contract, counterparty).join(
            Task, Task.id == TaskResponse.task_id
        ).outerjoin(
            Contract, Contract.task_response_id == TaskResponse.id
        ).join(
            counterparty, Task.customer_id == counterparty.id
        ).filter(
            TaskResponse.performer_id == target_user.id,
            TaskResponse.status == "accepted"
        )
        direction = "income"
    elif target_user.role in ["provider", "customer"]:
        query = db.query(TaskResponse, Task, Contract, counterparty).join(
            Task, Task.id == TaskResponse.task_id
        ).outerjoin(
            Contract, Contract.task_response_id == TaskResponse.id
        ).join(
            counterparty, TaskResponse.performer_id == counterparty.id
        ).filter(
            Task.customer_id == target_user.id,
            TaskResponse.status == "accepted"
        )
        direction = "outcome"
    else:
        return []

    rows = query.order_by(TaskResponse.submitted_at.desc()).all()
    history: List[PaymentHistoryItem] = []
    for response, task, contract, party in rows:
        occurred_at = contract.created_at if contract else response.submitted_at
        history.append(PaymentHistoryItem(
            response_id=response.id,
            contract_id=contract.id if contract else None,
            task_id=task.id,
            task_title=task.title,
            amount=task.price,
            direction=direction,
            counterparty_id=party.id,
            counterparty_name=party.name,
            occurred_at=occurred_at,
        ))
    return history
