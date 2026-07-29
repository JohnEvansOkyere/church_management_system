from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class EventCreate(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    max_capacity: Optional[int] = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_datetime and self.end_datetime <= self.start_datetime:
            raise ValueError("end_datetime must be after start_datetime")
        if self.is_recurring and not self.recurrence_rule:
            raise ValueError("recurrence_rule is required for recurring events")
        return self


class EventUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=180)
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    max_capacity: Optional[int] = Field(default=None, gt=0)


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    is_recurring: bool
    recurrence_rule: Optional[str] = None
    max_capacity: Optional[int] = None
    registration_count: int = 0
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime


class EventRegistrationCreate(BaseModel):
    member_id: UUID


class EventRegistrationResponse(BaseModel):
    id: UUID
    event_id: UUID
    member_id: UUID
    member_name: str
    phone: Optional[str] = None
    registered_at: datetime


class EventReminderRequest(BaseModel):
    message: Optional[str] = Field(default=None, max_length=918)
