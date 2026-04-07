import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text, Time, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    session_date = Column(Date, nullable=False)
    session_type = Column(String, nullable=True)
    session_start_time = Column(Time, nullable=True)
    notes = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    records = relationship("AttendanceRecord", back_populates="session")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    __table_args__ = (UniqueConstraint("session_id", "member_id", name="uq_session_member"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("attendance_sessions.id"), nullable=False)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    status = Column(String, nullable=False)
    checked_in_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    session = relationship("AttendanceSession", back_populates="records")
    member = relationship("Member", back_populates="attendance_records")
