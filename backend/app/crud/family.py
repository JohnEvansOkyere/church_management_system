from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.family import Family
from app.models.member import Member
from app.schemas.family import FamilyCreate


def list_families(db: Session, search: str | None = None, limit: int = 100):
    query = (
        db.query(Family, func.count(Member.id).label("member_count"))
        .outerjoin(Member, Member.family_id == Family.id)
        .group_by(Family.id)
        .order_by(Family.family_name.asc())
    )
    if search:
        query = query.filter(Family.family_name.ilike(f"%{search.strip()}%"))
    return query.limit(limit).all()


def get_family(db: Session, family_id: UUID) -> Family | None:
    return db.query(Family).filter(Family.id == family_id).first()


def create_family(db: Session, payload: FamilyCreate) -> Family:
    family_name = payload.family_name.strip()
    existing = db.query(Family).filter(func.lower(Family.family_name) == family_name.lower()).first()
    if existing:
        raise ValueError("A family with this name already exists")
    family = Family(family_name=family_name)
    db.add(family)
    db.commit()
    db.refresh(family)
    return family
