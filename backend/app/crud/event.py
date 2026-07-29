from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.event import Event, EventRegistration
from app.models.member import Member
from app.schemas.event import EventCreate, EventUpdate


def list_events(db: Session, upcoming_only: bool = True) -> list[Event]:
    query = db.query(Event)
    if upcoming_only:
        query = query.filter(Event.start_datetime >= func.now())
    return query.order_by(Event.start_datetime.asc()).all()


def get_event(db: Session, event_id: UUID) -> Event | None:
    return db.query(Event).filter(Event.id == event_id).first()


def registration_count(db: Session, event_id: UUID) -> int:
    return int(db.query(func.count(EventRegistration.id)).filter(EventRegistration.event_id == event_id).scalar() or 0)


def create_event(db: Session, payload: EventCreate, created_by: UUID | None) -> Event:
    event = Event(**payload.model_dump(), created_by=created_by)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event_id: UUID, payload: EventUpdate) -> Event | None:
    event = get_event(db, event_id)
    if not event:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event_id: UUID) -> bool:
    event = get_event(db, event_id)
    if not event:
        return False
    db.delete(event)
    db.commit()
    return True


def register_member(db: Session, event_id: UUID, member_id: UUID) -> EventRegistration:
    registration = EventRegistration(event_id=event_id, member_id=member_id)
    db.add(registration)
    db.commit()
    db.refresh(registration)
    return registration


def list_registrations(db: Session, event_id: UUID) -> list[EventRegistration]:
    return (
        db.query(EventRegistration)
        .join(Member, Member.id == EventRegistration.member_id)
        .filter(EventRegistration.event_id == event_id)
        .order_by(Member.first_name.asc(), Member.last_name.asc())
        .all()
    )
