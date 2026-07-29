from uuid import UUID

from sqlalchemy.orm import Session

from app.models.member import Member
from app.models.pastoral import PastoralLog
from app.schemas.pastoral import PastoralLogCreate, PastoralLogUpdate


def list_logs(db: Session, member_id: UUID | None = None, status: str | None = None) -> list[PastoralLog]:
    query = db.query(PastoralLog)
    if member_id:
        query = query.filter(PastoralLog.member_id == member_id)
    if status:
        query = query.filter(PastoralLog.status == status)
    return query.order_by(PastoralLog.log_date.desc(), PastoralLog.created_at.desc()).all()


def get_log(db: Session, log_id: UUID) -> PastoralLog | None:
    return db.query(PastoralLog).filter(PastoralLog.id == log_id).first()


def create_log(db: Session, payload: PastoralLogCreate, logged_by: UUID | None) -> PastoralLog:
    row = PastoralLog(**payload.model_dump(), logged_by=logged_by)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_log(db: Session, log_id: UUID, payload: PastoralLogUpdate) -> PastoralLog | None:
    row = get_log(db, log_id)
    if not row:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row
