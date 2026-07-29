from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate


def create_announcement(db: Session, payload: AnnouncementCreate, created_by: UUID | None) -> Announcement:
    announcement = Announcement(**payload.model_dump(exclude_none=True), created_by=created_by)
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


def list_announcements(db: Session, include_inactive: bool = False) -> list[Announcement]:
    now = datetime.now(timezone.utc)
    query = db.query(Announcement)
    if not include_inactive:
        query = query.filter(
            Announcement.is_active.is_(True),
            Announcement.publish_at <= now,
            (Announcement.expires_at.is_(None) | (Announcement.expires_at > now)),
        )
    return query.order_by(Announcement.publish_at.desc(), Announcement.created_at.desc()).all()


def get_announcement(db: Session, announcement_id: UUID) -> Announcement | None:
    return db.query(Announcement).filter(Announcement.id == announcement_id).first()


def update_announcement(db: Session, announcement_id: UUID, payload: AnnouncementUpdate) -> Announcement | None:
    announcement = get_announcement(db, announcement_id)
    if not announcement:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(announcement, field, value)
    db.commit()
    db.refresh(announcement)
    return announcement


def deactivate_announcement(db: Session, announcement_id: UUID) -> bool:
    announcement = get_announcement(db, announcement_id)
    if not announcement:
        return False
    announcement.is_active = False
    db.commit()
    return True
