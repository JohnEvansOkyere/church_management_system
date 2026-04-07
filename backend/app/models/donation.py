import uuid

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class DonationFund(Base):
    __tablename__ = "donation_funds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    donations = relationship("Donation", back_populates="fund")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=True)
    fund_id = Column(UUID(as_uuid=True), ForeignKey("donation_funds.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String, default="GHS", nullable=False)
    payment_method = Column(String, nullable=True)
    reference = Column(String, nullable=True)
    donation_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    recorded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    fund = relationship("DonationFund", back_populates="donations")
    member = relationship("Member")
