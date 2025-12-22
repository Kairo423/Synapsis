from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
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
