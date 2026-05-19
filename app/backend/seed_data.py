from sqlalchemy.orm import Session

from models.catalog_models import (
    ContractStatus,
    Domain,
    Skill,
    TaskStatus,
    TaskType,
)


DEFAULT_DOMAINS = [
    {
        "name": "Медицина",
        "description": "Медицинские изображения, тексты, анализы и клинические данные.",
    },
    {
        "name": "Право",
        "description": "Юридические документы, договоры, судебные материалы и нормативные тексты.",
    },
    {
        "name": "Лингвистика",
        "description": "Тексты, речь, переводы, классификация и разметка языка.",
    },
    {
        "name": "Финансы",
        "description": "Финансовые документы, отчеты, транзакции и риск-анализ.",
    },
    {
        "name": "Компьютерное зрение",
        "description": "Изображения, видео, bounding boxes, маски и классификация объектов.",
    },
    {
        "name": "Data Science",
        "description": "Датасеты, признаки, оценка качества данных и ML-разметка.",
    },
]


DEFAULT_SKILLS = [
    ("Медицинская разметка", "Аннотация медицинских снимков и клинических данных.", "Медицина"),
    ("Радиология", "Работа с рентгеном, КТ, МРТ и диагностическими изображениями.", "Медицина"),
    ("Юридическая экспертиза", "Анализ договоров, претензий и нормативных документов.", "Право"),
    ("Договорная работа", "Проверка условий, рисков и структуры договоров.", "Право"),
    ("Разметка текста", "Классификация, NER, тональность и смысловая аннотация текстов.", "Лингвистика"),
    ("Перевод и локализация", "Оценка качества перевода и адаптация текстов.", "Лингвистика"),
    ("Финансовый анализ", "Работа с отчетностью, платежами и финансовыми показателями.", "Финансы"),
    ("Оценка рисков", "Классификация финансовых и операционных рисков.", "Финансы"),
    ("Bounding boxes", "Разметка объектов прямоугольниками на изображениях.", "Компьютерное зрение"),
    ("Сегментация изображений", "Создание масок объектов и областей на изображениях.", "Компьютерное зрение"),
    ("Классификация данных", "Назначение классов объектам, записям и документам.", "Data Science"),
    ("Контроль качества", "Проверка, валидация и исправление разметки.", "Data Science"),
]


DEFAULT_TASK_TYPES = [
    {
        "name": "Классификация",
        "description": "Выбор одного или нескольких классов для объекта, документа или записи.",
    },
    {
        "name": "Разметка текста",
        "description": "Выделение сущностей, тональности, тем, интентов и других текстовых признаков.",
    },
    {
        "name": "Разметка изображений",
        "description": "Bounding boxes, полигоны, точки, маски и теги для изображений.",
    },
    {
        "name": "Сегментация",
        "description": "Пиксельная или областная разметка объектов на изображениях.",
    },
    {
        "name": "Транскрибация",
        "description": "Перевод аудио или видео в текст с проверкой качества.",
    },
    {
        "name": "Проверка качества",
        "description": "Ревью готовой разметки, поиск ошибок и подтверждение результата.",
    },
]


DEFAULT_TASK_STATUSES = [
    ("draft", "Черновик", "Задание сохранено, но еще не опубликовано."),
    ("new", "Новое", "Задание создано."),
    ("published", "Опубликовано", "Задание доступно исполнителям."),
    ("in_progress", "В работе", "Задание выполняется."),
    ("review", "На проверке", "Результат ожидает проверки."),
    ("completed", "Завершено", "Задание успешно завершено."),
    ("cancelled", "Отменено", "Задание отменено."),
    ("blocked", "Заблокировано", "Задание заблокировано администратором."),
]


DEFAULT_CONTRACT_STATUSES = [
    ("pending", "Ожидает", "Контракт создан и ожидает начала работы."),
    ("in_progress", "В работе", "Работа по контракту выполняется."),
    ("review", "На проверке", "Результат передан на проверку."),
    ("completed", "Завершен", "Контракт завершен."),
    ("cancelled", "Отменен", "Контракт отменен."),
]


def seed_catalogs(db: Session) -> None:
    domain_by_name = {domain.name: domain for domain in db.query(Domain).all()}

    for item in DEFAULT_DOMAINS:
        if item["name"] not in domain_by_name:
            domain = Domain(**item)
            db.add(domain)
            db.flush()
            domain_by_name[domain.name] = domain

    existing_skill_names = {skill.name for skill in db.query(Skill.name).all()}
    for name, description, domain_name in DEFAULT_SKILLS:
        if name in existing_skill_names:
            continue
        db.add(
            Skill(
                name=name,
                description=description,
                domain_id=domain_by_name[domain_name].id,
            )
        )

    existing_task_type_names = {task_type.name for task_type in db.query(TaskType.name).all()}
    for item in DEFAULT_TASK_TYPES:
        if item["name"] not in existing_task_type_names:
            db.add(TaskType(**item))

    existing_task_status_codes = {status.code for status in db.query(TaskStatus.code).all()}
    for code, name, description in DEFAULT_TASK_STATUSES:
        if code not in existing_task_status_codes:
            db.add(TaskStatus(code=code, name=name, description=description))

    existing_contract_status_codes = {
        status.code for status in db.query(ContractStatus.code).all()
    }
    for code, name, description in DEFAULT_CONTRACT_STATUSES:
        if code not in existing_contract_status_codes:
            db.add(ContractStatus(code=code, name=name, description=description))

    db.commit()
