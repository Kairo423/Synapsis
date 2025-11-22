# Dockerfile для запуска backend (FastAPI + Uvicorn)
# Предполагается, что файл `properties.txt` находится в корне репозитория.
# Рекомендация при сборке: запускать из корня репозитория, например:
#   docker build -f app/backend/Dockerfile -t synapsis-backend:latest .

FROM python:3.11.1

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Устанавливаем зависимости ОС
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем backend-код
COPY app/backend/ /app/

# Копируем файл зависимостей
COPY properties.txt /app/properties.txt

# Установим зависимости
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r properties.txt

# Откроем порт uvicorn
EXPOSE 8000

# Запуск Uvicorn. По умолчанию в продакшне --reload не включать оставить вторую команду.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
#CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
