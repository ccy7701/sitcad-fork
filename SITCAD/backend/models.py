from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Date, UniqueConstraint
from datetime import datetime, timezone, date
from database import Base

class User(Base):
  __tablename__ = "users"
  
  """
  1. 'id' in this case refers to the User UID created on the Firebase side, we use this as the unique identifier.
  2. role is nullable for new users who haven't finished onboarding.
  """
  id = Column(String, primary_key=True, index=True)
  email = Column(String, unique=True, index=True)
  full_name = Column(String)
  role = Column(String, nullable=True)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Student(Base):
  __tablename__ = "students"

  id = Column(String, primary_key=True, index=True)
  name = Column(String, nullable=False)
  age = Column(Integer, nullable=False)
  classroom = Column(String, nullable=True)
  parent_id = Column(String, ForeignKey("users.id"), nullable=False)
  teacher_id = Column(String, ForeignKey("users.id"), nullable=True)
  enrollment_date = Column(Date, default=lambda: date.today())
  needs_intervention = Column(Boolean, default=False)
  created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class StudentProgress(Base):
  __tablename__ = "student_progress"
  __table_args__ = (
    UniqueConstraint("student_id", "domain_key", "spr_code", name="uq_student_domain_spr"),
  )

  id = Column(Integer, primary_key=True, autoincrement=True)
  student_id = Column(String, ForeignKey("students.id"), nullable=False, index=True)
  domain_key = Column(String, nullable=False)
  spr_code = Column(String, nullable=False)
  level = Column(Integer, nullable=False)
  scored_by = Column(String, ForeignKey("users.id"), nullable=False)
  scored_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
  