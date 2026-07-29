from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class FamilyCreate(BaseModel):
    family_name: str = Field(min_length=2, max_length=160)


class FamilyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    family_name: str
    member_count: int = 0
