from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import relationship

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="new", nullable=False) # new, in_progress, review, completed, cancelled
    price = Column(Float, nullable=False)
    category = Column(String, nullable=True)
    difficulty = Column(String, nullable=True) # low, min, pro, expert
    deadline = Column(DateTime(timezone=True), nullable=True)
    repeats = Column(Integer, default=1, nullable=False)
    file_link = Column(String, nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    performer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    # Relationships can be added here if needed, e.g.
    customer = relationship("User", foreign_keys=[customer_id])
    performer = relationship("User", foreign_keys=[performer_id])
    attachments = relationship("TaskAttachment", back_populates="task", cascade="all, delete-orphan")
    responses = relationship("TaskResponse", back_populates="task", cascade="all, delete-orphan")
    domain_requirements = relationship("TaskDomainRequirement", back_populates="task", cascade="all, delete-orphan")
    skill_requirements = relationship("TaskSkillRequirement", back_populates="task", cascade="all, delete-orphan")
    type_assignment = relationship("TaskTypeAssignment", back_populates="task", uselist=False, cascade="all, delete-orphan")
    deliverables = relationship("TaskDeliverable", back_populates="task", cascade="all, delete-orphan")

class TaskAttachment(Base):
    __tablename__ = "task_attachments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    file_url = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="attachments")

class TaskResponse(Base):
    __tablename__ = "task_responses"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    performer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=True)
    attachment_url = Column(String, nullable=True)
    status = Column(String, default="submitted", nullable=False) # submitted, accepted, rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="responses")
    performer = relationship("User")

class TaskDomainRequirement(Base):
    __tablename__ = "task_domain_requirements"
    __table_args__ = (UniqueConstraint("task_id", "domain_id", name="uq_task_domain"),)

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    domain_id = Column(Integer, ForeignKey("domains.id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", back_populates="domain_requirements")
    domain = relationship("Domain")

class TaskSkillRequirement(Base):
    __tablename__ = "task_skill_requirements"
    __table_args__ = (UniqueConstraint("task_id", "skill_id", name="uq_task_skill"),)

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    min_level = Column(Integer, nullable=True)

    task = relationship("Task", back_populates="skill_requirements")
    skill = relationship("Skill")

class TaskTypeAssignment(Base):
    __tablename__ = "task_type_assignments"
    __table_args__ = (UniqueConstraint("task_id", name="uq_task_type_task"),)

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    task_type_id = Column(Integer, ForeignKey("task_types.id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", back_populates="type_assignment")
    task_type = relationship("TaskType")

class TaskDeliverable(Base):
    __tablename__ = "task_deliverables"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    response_id = Column(Integer, ForeignKey("task_responses.id", ondelete="SET NULL"), nullable=True)
    contract_id = Column(Integer, ForeignKey("contracts.id", ondelete="SET NULL"), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_url = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="deliverables")
    response = relationship("TaskResponse")
    uploader = relationship("User")
