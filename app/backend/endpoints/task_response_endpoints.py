from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.task_models import TaskResponse, Task
from models.user_models import User
from schemas.task_response_schemas import (
    TaskResponseCreate, 
    TaskResponseUpdate, 
    TaskResponseRead, 
    TaskResponseStatusUpdate
)
from auth import get_current_user

router = APIRouter(prefix="/task_responses", tags=["task_responses"])

@router.post("/", response_model=TaskResponseRead, status_code=status.HTTP_201_CREATED)
async def create_task_response(
    response_data: TaskResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Создание отклика (связывание исполнителя с задачей).
    Статус выставляется 'in_progress', поля comment и attachment_url остаются пустыми.
    Только для исполнителей.
    """
    if current_user.role != "executor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только исполнители могут брать задачи в работу"
        )
    
    # Проверка существования задачи
    task = db.query(Task).filter(Task.id == response_data.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )
        
    # Проверка на дубликат
    existing = db.query(TaskResponse).filter(
        TaskResponse.task_id == response_data.task_id,
        TaskResponse.performer_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вы уже взяли эту задачу в работу"
        )

    new_response = TaskResponse(
        task_id=response_data.task_id,
        performer_id=current_user.id,
        status="in_progress", # В работе
        comment=None,
        attachment_url=None
    )
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    return new_response

@router.get("/", response_model=List[TaskResponseRead])
async def get_my_responses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Просмотр всех своих откликов.
    Только для исполнителей.
    """
    if current_user.role != "executor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен"
        )
    return db.query(TaskResponse).filter(TaskResponse.performer_id == current_user.id).all()

@router.get("/{response_id}", response_model=TaskResponseRead)
async def get_response_by_id(
    response_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Просмотр отклика по ID.
    Только для исполнителей и только свои отклики.
    """
    if current_user.role != "executor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен"
        )
    
    resp = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Отклик не найден")
        
    if resp.performer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваш отклик")
        
    return resp

@router.get("/provider/{provider_id}", response_model=List[TaskResponseRead])
async def get_responses_by_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Просмотр всех откликов на задачи конкретного поставщика.
    Только для самого поставщика.
    """
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только поставщики могут просматривать отклики на свои задачи"
        )
    
    if current_user.id != provider_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы можете просматривать только отклики на свои задачи"
        )
        
    responses = db.query(TaskResponse).join(Task).filter(
        Task.customer_id == provider_id
    ).all()
    return responses

@router.delete("/{response_id}")
async def delete_response(
    response_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Удаление отклика.
    Только для исполнителей и только свои отклики.
    """
    if current_user.role != "executor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен"
        )
        
    resp = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Отклик не найден")
        
    if resp.performer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваш отклик")
        
    db.delete(resp)
    db.commit()
    return {"message": "Отклик успешно удален"}

@router.put("/{response_id}", response_model=TaskResponseRead)
async def update_response(
    response_id: int,
    update_data: TaskResponseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Изменение отклика.
    Заполняются комментарий (comment) и опционально attachment_url.
    Статус меняется на 'submitted' (На проверке).
    Только для исполнителей.
    """
    if current_user.role != "executor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен"
        )
        
    resp = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Отклик не найден")
        
    if resp.performer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Это не ваш отклик")
    
    resp.comment = update_data.comment
    if update_data.attachment_url is not None:
        resp.attachment_url = update_data.attachment_url
        
    resp.status = "on_check" # На проверке
    
    db.commit()
    db.refresh(resp)
    return resp

@router.patch("/{response_id}/status", response_model=TaskResponseRead)
async def update_response_status(
    response_id: int,
    status_data: TaskResponseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Смена статуса отклика.
    Только для поставщиков (владельцев задачи).
    При принятии работы проверяется баланс поставщика и списывается оплата в пользу исполнителя.
    """
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только поставщики могут менять статус откликов"
        )
        
    resp = db.query(TaskResponse).filter(TaskResponse.id == response_id).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Отклик не найден")
    
    # Проверяем, что работа еще не была принята или отклонена окончательно (если нужно)
    if resp.status == "accepted" and status_data.status == "accepted":
        raise HTTPException(status_code=400, detail="Эта работа уже принята")

    # Проверяем, что задача принадлежит текущему поставщику
    task = db.query(Task).filter(Task.id == resp.task_id).first()
    if not task or task.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете менять статус откликов чужих задач"
        )

    # Логика оплаты при принятии работы
    if status_data.status == "accepted":
        # Проверяем баланс поставщика (берем актуальное значение из базы)
        db.refresh(current_user)
        if current_user.balance < task.price:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Недостаточно средств на балансе. Ваш баланс: {current_user.balance} ₽. Стоимость задачи: {task.price} ₽. Необходимо пополнить баланс."
            )
        
        # Получаем исполнителя
        performer = db.query(User).filter(User.id == resp.performer_id).first()
        if not performer:
            raise HTTPException(status_code=404, detail="Исполнитель не найден")
            
        # Списываем средства у поставщика
        current_user.balance -= task.price
        # Начисляем средства исполнителю
        performer.balance += task.price
        
    resp.status = status_data.status
    db.commit()
    db.refresh(resp)
    return resp
