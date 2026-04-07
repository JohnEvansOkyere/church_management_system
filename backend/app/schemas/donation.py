from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class DonationFundCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    requires_member: bool = False


class DonationFundResponse(BaseModel):
    id: UUID
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    requires_member: bool
    is_active: bool

    class Config:
        from_attributes = True


class FinanceBatchCreate(BaseModel):
    title: str
    service_date: date
    service_type: Optional[str] = None
    notes: Optional[str] = None


class FinanceBatchResponse(BaseModel):
    id: UUID
    title: str
    service_date: date
    service_type: Optional[str] = None
    notes: Optional[str] = None
    is_closed: bool
    recorded_by: Optional[UUID] = None
    created_at: datetime
    total_amount: Decimal = Decimal("0.00")
    transaction_count: int = 0

    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    member_id: Optional[UUID] = None
    batch_id: Optional[UUID] = None
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
    member_name: Optional[str] = None
    batch_id: Optional[UUID] = None
    batch_title: Optional[str] = None
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


class ExpenseCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ExpenseCategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    category_id: UUID
    amount: Decimal = Field(gt=0)
    expense_date: date
    currency: str = "GHS"
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    vendor_name: Optional[str] = None
    notes: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: UUID
    category_id: UUID
    category_name: Optional[str] = None
    amount: Decimal
    expense_date: date
    currency: str
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    vendor_name: Optional[str] = None
    notes: Optional[str] = None
    recorded_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
