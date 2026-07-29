from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    body: str = Field(min_length=1, max_length=5000)
    publish_at: datetime | None = None
    expires_at: datetime | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.publish_at and self.expires_at and self.expires_at <= self.publish_at:
            raise ValueError("expires_at must be after publish_at")
        return self


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    body: str | None = Field(default=None, min_length=1, max_length=5000)
    publish_at: datetime | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None

    @model_validator(mode="after")
    def validate_dates(self):
        if self.publish_at and self.expires_at and self.expires_at <= self.publish_at:
            raise ValueError("expires_at must be after publish_at")
        return self


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    body: str
    created_by: UUID | None = None
    is_active: bool
    publish_at: datetime
    expires_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
