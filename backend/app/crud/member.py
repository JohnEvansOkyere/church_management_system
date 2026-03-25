import csv
import io
from datetime import date, timedelta
from uuid import UUID

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.family import Family
from app.models.member import Member
from app.schemas.member import MemberCreate, MemberUpdate


def build_low_attendance_map(db: Session, member_ids: list[UUID]) -> dict[UUID, bool]:
    if not member_ids:
        return {}

    cutoff = date.today() - timedelta(days=30)
    last_present_rows = (
        db.query(AttendanceRecord.member_id, func.max(AttendanceSession.session_date).label("last_present_date"))
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .filter(AttendanceRecord.member_id.in_(member_ids), AttendanceRecord.status == "present")
        .group_by(AttendanceRecord.member_id)
        .all()
    )
    last_present = {row.member_id: row.last_present_date for row in last_present_rows}

    result: dict[UUID, bool] = {}
    for member_id in member_ids:
        last_date = last_present.get(member_id)
        result[member_id] = last_date is None or last_date <= cutoff
    return result


def get_members(db: Session, skip: int = 0, limit: int = 20, search: str | None = None, status: str | None = None):
    query = db.query(Member)

    if search:
        keyword = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Member.first_name.ilike(keyword),
                Member.last_name.ilike(keyword),
                Member.phone.ilike(keyword),
                Member.email.ilike(keyword),
            )
        )

    if status:
        query = query.filter(Member.membership_status == status)

    total = query.count()
    members = query.order_by(Member.created_at.desc()).offset(skip).limit(limit).all()
    return members, total


def get_member(db: Session, member_id: UUID) -> Member | None:
    return db.query(Member).filter(Member.id == member_id).first()


def create_member(db: Session, payload: MemberCreate) -> Member:
    data = payload.model_dump(exclude={"family_name"})

    if payload.is_family_head and payload.family_name:
        family = Family(family_name=payload.family_name)
        db.add(family)
        db.flush()
        data["family_id"] = family.id

    member = Member(**data)
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_member(db: Session, member_id: UUID, payload: MemberUpdate) -> Member | None:
    member = get_member(db, member_id)
    if not member:
        return None

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)
    return member


def soft_delete_member(db: Session, member_id: UUID) -> bool:
    member = get_member(db, member_id)
    if not member:
        return False

    member.membership_status = "inactive"
    db.commit()
    return True


def get_members_by_family(db: Session, family_id: UUID) -> list[Member]:
    return db.query(Member).filter(Member.family_id == family_id).order_by(Member.created_at.desc()).all()


def generate_members_csv(members: list[Member]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["name", "phone", "email", "status", "date_joined"])

    for member in members:
        full_name = f"{member.first_name} {member.last_name}".strip()
        writer.writerow([
            full_name,
            member.phone or "",
            member.email or "",
            member.membership_status or "",
            member.date_joined.isoformat() if member.date_joined else "",
        ])

    return output.getvalue()
