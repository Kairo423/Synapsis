# Dockerfile для запуска backend (FastAPI + Uvicorn)
# Предполагается, что файл `properties.txt` находится в корне репозитория.
# Рекомендация при сборке: запускать из корня репозитория, например:
#   docker build -f app/backend/Dockerfile -t synapsis-backend:latest .

FROM python:3.11.1

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Скопируем requirements (properties.txt должен быть в контексте сборки)
COPY properties.txt /app/requirements.txt

# Установим зависимости
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Скопируем код бэкенда
COPY ./app/backend /app

# Откроем порт uvicorn
EXPOSE 8000

# Запуск Uvicorn. По умолчанию в продакшне --reload не включён.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
