from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, aliased

from auth import get_current_user
from database import get_db
from models.contract_models import Contract
from models.task_models import Task, TaskResponse
from models.user_models import User
from schemas.admin_schemas import (
    AdminReportSummary,
    AdminStats,
    AdminTaskRead,
    AdminTaskStatusUpdate,
    AdminUserStatusUpdate,
)
from schemas.contract_schemas import ContractRead
from schemas.user_schemas import UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ только для администратора"
        )
    return current_user


def serialize_task(task: Task, customer: User, performer: Optional[User]) -> AdminTaskRead:
    return AdminTaskRead(
        id=task.id,
        title=task.title,
        status=task.status,
        price=task.price,
        category=task.category,
        difficulty=task.difficulty,
        deadline=task.deadline,
        customer_id=task.customer_id,
        customer_name=customer.name if customer else None,
        performer_id=task.performer_id,
        performer_name=performer.name if performer else None,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    return query.all()


@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    if user_id == current_user.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Нельзя деактивировать самого себя")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.get("/tasks", response_model=List[AdminTaskRead])
async def list_tasks(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    customer = aliased(User)
    performer = aliased(User)
    query = db.query(Task, customer, performer).join(
        customer, Task.customer_id == customer.id
    ).outerjoin(
        performer, Task.performer_id == performer.id
    )
    if status_filter:
        query = query.filter(Task.status == status_filter)
    rows = query.order_by(Task.created_at.desc()).all()
    return [serialize_task(task, customer_row, performer_row) for task, customer_row, performer_row in rows]


@router.patch("/tasks/{task_id}/status", response_model=AdminTaskRead)
async def update_task_status(
    task_id: int,
    payload: AdminTaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    task.status = payload.status
    db.commit()
    db.refresh(task)

    customer = db.query(User).filter(User.id == task.customer_id).first()
    performer = db.query(User).filter(User.id == task.performer_id).first() if task.performer_id else None
    return serialize_task(task, customer, performer)


@router.get("/contracts", response_model=List[ContractRead])
async def list_contracts(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    query = db.query(Contract)
    if status_filter:
        query = query.filter(Contract.status == status_filter)
    return query.order_by(Contract.created_at.desc()).all()


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    users_total = db.query(func.count(User.id)).scalar() or 0
    users_active = db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0
    users_blocked = db.query(func.count(User.id)).filter(User.is_active.is_(False)).scalar() or 0
    users_by_role_rows = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    users_by_role = {role: count for role, count in users_by_role_rows}

    tasks_total = db.query(func.count(Task.id)).scalar() or 0
    tasks_by_status_rows = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
    tasks_by_status = {status: count for status, count in tasks_by_status_rows}

    contracts_total = db.query(func.count(Contract.id)).scalar() or 0
    contracts_by_status_rows = db.query(Contract.status, func.count(Contract.id)).group_by(Contract.status).all()
    contracts_by_status = {status: count for status, count in contracts_by_status_rows}

    task_responses_total = db.query(func.count(TaskResponse.id)).scalar() or 0
    payments_total = db.query(
        func.coalesce(func.sum(Task.price), 0.0)
    ).join(
        TaskResponse, TaskResponse.task_id == Task.id
    ).filter(
        TaskResponse.status == "accepted"
    ).scalar() or 0.0

    return AdminStats(
        users_total=users_total,
        users_active=users_active,
        users_blocked=users_blocked,
        users_by_role=users_by_role,
        tasks_total=tasks_total,
        tasks_by_status=tasks_by_status,
        contracts_total=contracts_total,
        contracts_by_status=contracts_by_status,
        task_responses_total=task_responses_total,
        payments_total=float(payments_total),
    )


@router.get("/reports/summary", response_model=AdminReportSummary)
async def get_admin_report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_admin(current_user)
    stats = await get_admin_stats(db=db, current_user=current_user)

    customer = aliased(User)
    performer = aliased(User)
    task_rows = db.query(Task, customer, performer).join(
        customer, Task.customer_id == customer.id
    ).outerjoin(
        performer, Task.performer_id == performer.id
    ).order_by(Task.created_at.desc()).limit(10).all()
    recent_tasks = [serialize_task(task, customer_row, performer_row) for task, customer_row, performer_row in task_rows]

    recent_contracts = db.query(Contract).order_by(Contract.created_at.desc()).limit(10).all()

    return AdminReportSummary(
        generated_at=datetime.now(timezone.utc),
        stats=stats,
        recent_tasks=recent_tasks,
        recent_contracts=recent_contracts,
    )
