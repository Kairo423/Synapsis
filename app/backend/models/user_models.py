from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.sql import func
from database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "customer" или "executor"
    name = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    
    
    def set_password(self, password: str):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)
    
    def update_from_dict(self, data: dict):
        """Обновление полей пользователя из словаря"""
        for key, value in data.items():
            if hasattr(self, key) and value is not None:
                if key == 'password':
                    self.set_password(value)
                else:
                    setattr(self, key, value)