from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from auth import get_current_user
from database import get_db
from models.chat_models import TaskMessage
from models.contract_models import Contract
from models.task_models import Task
from models.user_models import User
from schemas.chat_schemas import TaskMessageCreate, TaskMessageRead

router = APIRouter(prefix="/tasks", tags=["chat"])


def ensure_chat_access(task: Task, current_user: User, db: Session) -> None:
    if current_user.role == "admin":
        return
    if task.customer_id == current_user.id:
        return
    if task.performer_id == current_user.id:
        return
    contract = db.query(Contract).filter(
        Contract.task_id == task.id,
        Contract.performer_id == current_user.id
    ).first()
    if contract:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ к чату запрещен")


@router.get("/{task_id}/messages", response_model=List[TaskMessageRead])
async def list_task_messages(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    ensure_chat_access(task, current_user, db)

    messages = db.query(TaskMessage).filter(
        TaskMessage.task_id == task_id
    ).order_by(TaskMessage.created_at.asc()).all()

    return [
        TaskMessageRead(
            id=message.id,
            task_id=message.task_id,
            sender_id=message.sender_id,
            sender_name=message.sender.name if message.sender else None,
            content=message.content,
            created_at=message.created_at
        )
        for message in messages
    ]


@router.post("/{task_id}/messages", response_model=TaskMessageRead, status_code=status.HTTP_201_CREATED)
async def create_task_message(
    task_id: int,
    payload: TaskMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задание не найдено")
    ensure_chat_access(task, current_user, db)

    content = (payload.content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Сообщение не может быть пустым")

    message = TaskMessage(
        task_id=task_id,
        sender_id=current_user.id,
        content=content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    return TaskMessageRead(
        id=message.id,
        task_id=message.task_id,
        sender_id=message.sender_id,
        sender_name=current_user.name,
        content=message.content,
        created_at=message.created_at
    )
