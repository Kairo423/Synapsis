from sqlalchemy import Column, Integer, String, Text, DateTime, UniqueConstraint, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Domain(Base):
    __tablename__ = "domains"
    __table_args__ = (UniqueConstraint("name", name="uq_domain_name"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (UniqueConstraint("name", name="uq_skill_name"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    domain_id = Column(Integer, ForeignKey("domains.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    domain = relationship("Domain")

class TaskType(Base):
    __tablename__ = "task_types"
    __table_args__ = (UniqueConstraint("name", name="uq_task_type_name"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TaskStatus(Base):
    __tablename__ = "task_statuses"
    __table_args__ = (UniqueConstraint("code", name="uq_task_status_code"),)

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ContractStatus(Base):
    __tablename__ = "contract_statuses"
    __table_args__ = (UniqueConstraint("code", name="uq_contract_status_code"),)

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
