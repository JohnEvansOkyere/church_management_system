from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class FamilyCreate(BaseModel):
    family_name: str


class MemberBase(BaseModel):
    first_name: str
    last_name: str
    other_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    membership_status: Optional[str] = "active"
    date_joined: Optional[date] = None
    baptism_date: Optional[date] = None
    membership_class_completed: bool = False
    family_id: Optional[UUID] = None
    is_family_head: bool = False


class MemberCreate(MemberBase):
    family_name: Optional[str] = None


class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    other_name: Optional[str] = None
    photo_url: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    membership_status: Optional[str] = None
    date_joined: Optional[date] = None
    baptism_date: Optional[date] = None
    membership_class_completed: Optional[bool] = None
    family_id: Optional[UUID] = None
    is_family_head: Optional[bool] = None


class MemberResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    other_name: Optional[str] = None
    photo_url: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    occupation: Optional[str] = None
    marital_status: Optional[str] = None
    membership_status: Optional[str] = None
    date_joined: Optional[date] = None
    baptism_date: Optional[date] = None
    membership_class_completed: bool
    family_id: Optional[UUID] = None
    is_family_head: bool
    low_attendance: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
