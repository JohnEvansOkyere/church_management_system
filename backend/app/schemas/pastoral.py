from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PastoralLogCreate(BaseModel):
    member_id: UUID
    log_type: str = Field(min_length=2, max_length=60)
    notes: str = Field(min_length=1, max_length=5000)
    status: str = Field(default="open", pattern="^(open|completed)$")
    follow_up_date: Optional[date] = None
    log_date: date


class PastoralLogUpdate(BaseModel):
    log_type: Optional[str] = Field(default=None, min_length=2, max_length=60)
    notes: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    status: Optional[str] = Field(default=None, pattern="^(open|completed)$")
    follow_up_date: Optional[date] = None


class PastoralLogResponse(BaseModel):
    id: UUID
    member_id: UUID
    member_name: Optional[str] = None
    log_type: str
    notes: str
    status: str
    follow_up_date: Optional[date] = None
    logged_by: Optional[UUID] = None
    log_date: date
    created_at: datetime
