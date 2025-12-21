from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.task_models import Task
from schemas.task_schemas import TaskCreate, TaskResponse, TaskUpdate
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Создание новой задачи. Только для пользователей с ролью 'provider' или 'admin'.
    """
    if current_user.role not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только поставщики (provider) могут создавать задачи"
        )
    
    task = Task(
        **task_data.dict(),
        customer_id=current_user.id,
        status="new"
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Получение списка задач
    """
    tasks = db.query(Task).offset(skip).limit(limit).all()
    return tasks

@router.get("/my", response_model=List[TaskResponse])
async def get_my_tasks(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Получение списка задач текущего поставщика
    """
    if current_user.role != "provider":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только поставщики могут просматривать свои задачи"
        )
    
    tasks = db.query(Task).filter(Task.customer_id == current_user.id).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    Получение задачи по ID
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int, 
    task_update: TaskUpdate, 
    current_user = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Обновление задачи. Только владелец или админ.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if current_user.role not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на редактирование задач"
        )
    
    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете редактировать чужие задачи"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Удаление задачи. Только владелец или админ.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    
    if current_user.role not in ["provider", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет прав на удаление задач"
        )

    if current_user.role != "admin" and task.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете удалять чужие задачи"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Задача успешно удалена"}
