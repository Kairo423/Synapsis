from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from auth import get_current_user
from models.contract_models import Contract
from models.task_models import Task, TaskResponse
from models.user_models import User
from schemas.contract_schemas import ContractCreate, ContractRead, ContractStatusUpdate

router = APIRouter(prefix="/contracts", tags=["contracts"])

def require_customer(current_user: User):
    if current_user.role not in ["provider", "customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только заказчики могут создавать контракты"
        )
    return current_user

@router.post("/", response_model=ContractRead, status_code=status.HTTP_201_CREATED)
async def create_contract(
    payload: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_customer(current_user)
    task = None
    response = None
    performer_id = payload.performer_id

    if payload.task_response_id:
        response = db.query(TaskResponse).filter(TaskResponse.id == payload.task_response_id).first()
        if not response:
            raise HTTPException(status_code=404, detail="Отклик не найден")
        task = db.query(Task).filter(Task.id == response.task_id).first()
        performer_id = response.performer_id
    elif payload.task_id and payload.performer_id:
        task = db.query(Task).filter(Task.id == payload.task_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Укажите task_response_id или task_id + performer_id"
        )

    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")

    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Вы не можете создавать контракт для чужого задания")

    performer = db.query(User).filter(User.id == performer_id).first()
    if not performer:
        raise HTTPException(status_code=404, detail="Исполнитель не найден")
    if performer.role != "executor":
        raise HTTPException(status_code=400, detail="Выбранный пользователь не является исполнителем")

    existing = db.query(Contract).filter(
        Contract.task_id == task.id,
        Contract.performer_id == performer_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Контракт с этим исполнителем уже существует")

    contract = Contract(
        task_id=task.id,
        task_response_id=response.id if response else None,
        customer_id=task.customer_id,
        performer_id=performer_id,
        status=payload.status or "active",
        agreed_price=payload.agreed_price if payload.agreed_price is not None else task.price
    )
    db.add(contract)

    if task.performer_id is None:
        task.performer_id = performer_id
    if task.status in ["new", "draft", "published"]:
        task.status = "in_progress"

    db.commit()
    db.refresh(contract)
    return contract

@router.get("/", response_model=List[ContractRead])
async def list_contracts(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Contract)
    if current_user.role != "admin":
        query = query.filter(
            (Contract.customer_id == current_user.id) | (Contract.performer_id == current_user.id)
        )
    if status_filter:
        query = query.filter(Contract.status == status_filter)
    return query.all()

@router.get("/{contract_id}", response_model=ContractRead)
async def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Контракт не найден")
    if current_user.role != "admin" and current_user.id not in [contract.customer_id, contract.performer_id]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")
    return contract

@router.patch("/{contract_id}/status", response_model=ContractRead)
async def update_contract_status(
    contract_id: int,
    payload: ContractStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Контракт не найден")
    if current_user.role != "admin" and current_user.id not in [contract.customer_id, contract.performer_id]:
        raise HTTPException(status_code=403, detail="Доступ запрещен")

    contract.status = payload.status

    task = db.query(Task).filter(Task.id == contract.task_id).first()
    if task and payload.status in ["in_progress", "review", "completed", "cancelled"]:
        task.status = payload.status

    db.commit()
    db.refresh(contract)
    return contract
