from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, UniqueConstraint, String
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class ExpertProfile(Base):
    __tablename__ = "expert_profiles"
    __table_args__ = (UniqueConstraint("user_id", name="uq_expert_profile_user"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    main_domain_id = Column(Integer, ForeignKey("domains.id", ondelete="SET NULL"), nullable=True)
    rate = Column(Float, nullable=True)
    experience_years = Column(Integer, nullable=True)
    verification_document_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User")
    main_domain = relationship("Domain")

class ExpertSkill(Base):
    __tablename__ = "expert_skills"
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="uq_expert_skill"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    level = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    skill = relationship("Skill")
