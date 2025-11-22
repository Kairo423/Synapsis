import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Читаем переменные окружения. Если внутри контейнера переменная не задана,
# подставляем разумные значения по умолчанию где это уместно.
DB_HOST = os.getenv("DB_HOST")
# DB_PORT может отсутствовать — подставляем строковый дефолт '5432'
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Небольшая валидация — чтобы было понятнее, если переменные не заданы
missing = [name for name, val in (
    ("DB_HOST", DB_HOST), ("DB_NAME", DB_NAME), ("DB_USER", DB_USER), ("DB_PASSWORD", DB_PASSWORD)
) if not val]
if missing:
    raise RuntimeError(f"Missing required DB env vars: {', '.join(missing)}")

# Убедимся, что порт — число
try:
    int(DB_PORT)
except (TypeError, ValueError):
    raise RuntimeError(f"Invalid DB_PORT value: {DB_PORT}")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()