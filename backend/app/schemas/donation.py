from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DonationFundCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DonationFundResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    member_id: Optional[UUID] = None
    fund_id: UUID
    amount: Decimal = Field(gt=0)
    currency: str = "GHS"
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    donation_date: date
    notes: Optional[str] = None


class DonationResponse(BaseModel):
    id: UUID
    member_id: Optional[UUID] = None
    fund_id: UUID
    fund_name: Optional[str] = None
    amount: Decimal
    currency: str
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    donation_date: date
    notes: Optional[str] = None
    recorded_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
