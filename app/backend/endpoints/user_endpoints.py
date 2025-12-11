from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
# Убраны неиспользуемые импорты HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.user_models import User  # Исправлен импорт
from schemas.user_schemas import UserCreate, UserResponse, UserLogin, UserUpdate  # Исправлен импорт + добавлен UserUpdate
from typing import List
from auth import get_current_user, role_required, security, config

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя
    """
    # Проверяем, нет ли уже пользователя с таким email
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Валидация роли теперь автоматическая через Pydantic Enum
    # Создаем пользователя
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role.value  # Берем значение из Enum
    )
    user.set_password(user_data.password)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/login")
async def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Аутентификация пользователя
    """
    user = db.query(User).filter(User.email == login_data.email).first()

    if not user or not user.verify_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Генерация токена
    token = security.create_access_token(uid=str(user.id))

    # Установка токена в куки
    response.set_cookie(
        key=config.JWT_ACCESS_COOKIE_NAME,
        value=token,
        httponly=True
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "user_id": user.id,
        "role": user.role,
        "name": user.name
    }

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Получение информации о пользователе по ID
    """
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Ошибка доступа. Функция недоступна для роли '{current_user.role}'"
        )
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    return user

@router.get("/", response_model=list[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Получение списка пользователей с пагинацией
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_update: UserUpdate,  # Исправлено на UserUpdate
    db: Session = Depends(get_db)
):
    """
    Обновление информации о пользователе
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Проверяем email на уникальность (если изменен)
    if user_update.email and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Используем update_from_dict для частичного обновления
    update_data = user_update.dict(exclude_unset=True)
    
    # Конвертируем Enum в строку если нужно
    if 'role' in update_data and hasattr(update_data['role'], 'value'):
        update_data['role'] = update_data['role'].value
    
    user.update_from_dict(update_data)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Удаление пользователя (мягкое удаление)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}
