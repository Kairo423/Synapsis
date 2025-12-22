from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
import jwt
from sqlalchemy.orm import Session
from database import get_db
from models.user_models import User, PasswordResetCode
from schemas.user_schemas import (
    UserCreate, UserResponse, UserLogin, UserUpdate, 
    UserDescriptionUpdate, PasswordResetRequest, PasswordResetConfirm
)
import random
import string
from utils.email import send_reset_code
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
    refresh_token = security.create_refresh_token(uid=str(user.id))

    response.set_cookie(
        key=config.JWT_ACCESS_COOKIE_NAME,
        value=token,
        httponly=True
    )
    
    response.set_cookie(
        key=config.JWT_REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True
    )

    return {
        "message": "Успешная авторизация",
        "access_token": token,
        "user_id": user.id,
        "role": user.role,
        "name": user.name,
        "balance": user.balance
    }

@router.post("/logout")
async def logout(response: Response):
    """
    Выход из системы (удаление куки)
    """
    response.delete_cookie(config.JWT_ACCESS_COOKIE_NAME)
    response.delete_cookie(config.JWT_REFRESH_COOKIE_NAME)
    return {"message": "Успешный выход"}

@router.post("/refresh")
async def refresh_token(response: Response, request: Request):
    """
    Обновление access token через refresh token
    """
    refresh_token = request.cookies.get(config.JWT_REFRESH_COOKIE_NAME)
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token отсутствует"
        )
        
    try:
        payload = jwt.decode(
            refresh_token,
            config.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Некорректный токен"
            )
            
        new_access_token = security.create_access_token(uid=str(user_id))
        
        response.set_cookie(
            key=config.JWT_ACCESS_COOKIE_NAME,
            value=new_access_token,
            httponly=True
        )
        
        return {"message": "Token refreshed"}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token истек"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный refresh token"
        )

@router.get("/balance")
async def get_user_balance(current_user: User = Depends(get_current_user)):
    """
    Получение баланса текущего пользователя
    """
    return {"balance": current_user.balance}

@router.post("/topup")
async def topup_balance(amount_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Пополнение баланса текущего пользователя
    """
    amount = amount_data.get("amount")
    if not amount or amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сумма пополнения должна быть больше 0"
        )
    
    current_user.balance += amount
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Баланс успешно пополнен", "new_balance": current_user.balance}

@router.post("/withdraw")
async def withdraw_balance(amount_data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Вывод средств с баланса текущего пользователя
    """
    amount = amount_data.get("amount")
    if not amount or amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Сумма вывода должна быть больше 0"
        )
    
    if current_user.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недостаточно средств на балансе"
        )
    
    current_user.balance -= amount
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Вывод средств выполнен успешно", "new_balance": current_user.balance}

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

@router.put("/description", response_model=UserResponse)
async def update_user_description(
    description_update: UserDescriptionUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Обновление описания текущего пользователя
    """
    current_user.description = description_update.description
    db.commit()
    db.refresh(current_user)
    
    return current_user

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


@auth_router.post("/password-reset/request")
async def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Запрос на восстановление пароля. Генерирует код и "отправляет" его на почту.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Для безопасности не сообщаем, существует ли такой email
        return {"message": "Если такой email зарегистрирован, код подтверждения был отправлен"}

    # Генерируем 6-значный код
    code = ''.join(random.choices(string.digits, k=6))
    
    # Сохраняем код в базе (удаляем старые неиспользованные коды для этого email)
    db.query(PasswordResetCode).filter(PasswordResetCode.email == request.email, PasswordResetCode.is_used == False).delete()
    
    reset_code = PasswordResetCode(email=request.email, code=code)
    db.add(reset_code)
    db.commit()
    
    # Отправка email
    if not send_reset_code(request.email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при отправке письма. Проверьте настройки SMTP."
        )
    
    return {"message": "Код подтверждения отправлен на почту"}

@auth_router.post("/password-reset/confirm")
async def confirm_password_reset(confirm: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Подтверждение восстановления пароля с использованием кода.
    """
    reset_record = db.query(PasswordResetCode).filter(
        PasswordResetCode.email == confirm.email,
        PasswordResetCode.code == confirm.code,
        PasswordResetCode.is_used == False
    ).first()
    
    if not reset_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный код или email"
        )
    
    # Проверка срока действия (например, 15 минут)
    from datetime import datetime, timezone, timedelta
    if datetime.now(timezone.utc) - reset_record.created_at.replace(tzinfo=timezone.utc) > timedelta(minutes=15):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Срок действия кода истек"
        )
        
    user = db.query(User).filter(User.email == confirm.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
        
    user.set_password(confirm.new_password)
    reset_record.is_used = True
    db.commit()
    
    return {"message": "Пароль успешно изменен"}


__all__ = ["router", "auth_router"]
