from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from models.user_models import User
from schemas.user_schemas import UserCreate, UserResponse, UserLogin, UserUpdate
from typing import List
from auth import get_current_user, role_required, security, config

router = APIRouter(prefix="/users", tags=["users"])
auth_router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Регистрация нового пользователя
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role.value
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
            detail="Неправильный пароль"
        )

    token = security.create_access_token(uid=str(user.id))

    response.set_cookie(
        key=config.JWT_ACCESS_COOKIE_NAME,
        value=token,
        httponly=True
    )

    return {
        "message": "Успешная авторизация",
        "access_token": token,
        "user_id": user.id,
        "role": user.role,
        "name": user.name
    }

@router.post("/logout")
async def logout(response: Response):
    """
    Выход из системы (удаление куки)
    """
    response.delete_cookie(config.JWT_ACCESS_COOKIE_NAME)
    return {"message": "Успешный выход"}

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Получение информации о пользователе по ID
    Требует аутентификацию - пользователь может получить только свои данные или администратор может получить любого пользователя
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к информации других пользователей"
        )
    
    return user

@router.get("/", response_model=list[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Получение списка пользователей с пагинацией
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к информации других пользователей"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,  # Исправлено на UserUpdate
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновление информации о пользователе
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="У вас нет доступа к обновлению информации других пользователей"
        )
    
    if user_update.email and user_update.email != user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email уже зарегистрирован"
            )
    
    update_data = user_update.dict(exclude_unset=True)
    
    if 'role' in update_data and hasattr(update_data['role'], 'value'):
        update_data['role'] = update_data['role'].value
    
    user.update_from_dict(update_data)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Удаление пользователя (мягкое удаление)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Проверяем, является ли текущий пользователь администратором или удаляет себя
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Вы не можете удалять других пользователей"
        )
    
    user.is_active = False
    db.commit()
    
    return {"message": "Пользователь успешно деактивирован"}


@auth_router.get("/me", tags=["authentication"])
async def get_current_user_info(current_user = Depends(get_current_user)):
    return current_user

@auth_router.get("/admin", tags=["authentication"])
async def admin_only(current_user = Depends(get_current_user)):
    # Проверяем роль пользователя напрямую
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"У вас нет доступа, так как вы не admin, а '{current_user.role}'"
        )
    return {"message": "Добро пожаловать, admin!", "user_id": current_user.id, "email": current_user.email, "role": current_user.role}

@auth_router.get("/customer", tags=["authentication"])
async def customer_access(current_user = Depends(get_current_user)):
    if current_user.role not in ["customer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"У вас нет доступа, так как вы не customer либо admin. Ваша роль: '{current_user.role}'"
        )
    return {"message": "Добро пожаловать, customer!", "user_id": current_user.id, "email": current_user.email, "role": current_user.role}


__all__ = ["router", "auth_router"]
