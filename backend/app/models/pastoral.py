import uuid

from sqlalchemy import Column, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class PastoralLog(Base):
    __tablename__ = "pastoral_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    log_type = Column(String, nullable=False)
    notes = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="open")
    follow_up_date = Column(Date, nullable=True)
    logged_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    log_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    member = relationship("Member")
