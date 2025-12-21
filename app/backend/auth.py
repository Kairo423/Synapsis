import os
import jwt
from authx import AuthX, AuthXConfig
from fastapi import HTTPException, status, Request, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user_models import User

config = AuthXConfig()
config.JWT_SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
config.JWT_ACCESS_COOKIE_NAME = "my_access_token"
config.JWT_REFRESH_COOKIE_NAME = "my_refresh_token"
config.JWT_TOKEN_LOCATION = ["cookies"]
security = AuthX(config=config)


def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    Получение текущего пользователя из куки с токеном
    """
    token = request.cookies.get(config.JWT_ACCESS_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Вы не авторизованы"
        )
    
    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Некорректный токен"
            )
        user_id: int = int(user_id_raw) if user_id_raw is not None else None
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"User not found with id: {user_id}"
            )
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен истек. Войдите заново"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный токен"
        )
    except Exception as e:
        print(f"Authentication error: {str(e)}, token: {token[:20] if token else None}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный токен"
        )
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Некорректный токен"
        )


def role_required(allowed_roles: list):
    """
    Декоратор для проверки роли пользователя
    """
    def decorator(user: User = Depends(get_current_user)):
        allowed_str_roles = [str(role) for role in allowed_roles]
        user_role_str = str(user.role)
        
        if user_role_str not in allowed_str_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ заблокирован для роли '{user_role_str}'"
            )
        return user
    return decorator