from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class GroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: Optional[str] = None
    leader_id: Optional[UUID] = None


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = None
    leader_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class GroupResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    leader_id: Optional[UUID] = None
    leader_name: Optional[str] = None
    member_count: int = 0
    is_active: bool
    created_at: datetime
    updated_at: datetime


class GroupMemberResponse(BaseModel):
    id: UUID
    member_id: UUID
    member_name: str
    phone: Optional[str] = None
    joined_at: datetime


class GroupMemberCreate(BaseModel):
    member_id: UUID
