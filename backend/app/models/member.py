import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    other_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    introduced_by = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    membership_status = Column(String, nullable=True, default="active")
    date_joined = Column(Date, nullable=True)
    baptism_date = Column(Date, nullable=True)
    membership_class_completed = Column(Boolean, default=False, nullable=False)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id"), nullable=True)
    is_family_head = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    family = relationship("Family", back_populates="members")
    attendance_records = relationship("AttendanceRecord", back_populates="member")
    group_memberships = relationship("GroupMember", back_populates="member", cascade="all, delete-orphan")
    groups = relationship("Group", secondary="group_members", viewonly=True)
