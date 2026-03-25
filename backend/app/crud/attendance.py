from collections import defaultdict
from datetime import date, datetime, timezone
from uuid import UUID

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.member import Member
from app.schemas.attendance import AttendanceMarkItem, AttendanceSessionCreate


def list_sessions(db: Session, skip: int = 0, limit: int = 20) -> tuple[list[AttendanceSession], int]:
    query = db.query(AttendanceSession)
    total = query.count()
    sessions = query.order_by(AttendanceSession.session_date.desc()).offset(skip).limit(limit).all()
    return sessions, total


def create_session(db: Session, payload: AttendanceSessionCreate, created_by: UUID | None) -> AttendanceSession:
    session = AttendanceSession(**payload.model_dump(), created_by=created_by)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session(db: Session, session_id: UUID) -> AttendanceSession | None:
    return db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()


def mark_attendance(db: Session, session_id: UUID, records: list[AttendanceMarkItem]) -> list[AttendanceRecord]:
    existing = (
        db.query(AttendanceRecord)
        .filter(AttendanceRecord.session_id == session_id, AttendanceRecord.member_id.in_([r.member_id for r in records]))
        .all()
    )
    existing_map = {(row.session_id, row.member_id): row for row in existing}

    touched: list[AttendanceRecord] = []
    for item in records:
        key = (session_id, item.member_id)
        checked_in_at = datetime.now(timezone.utc) if item.status == "present" else None
        if key in existing_map:
            row = existing_map[key]
            row.status = item.status
            row.checked_in_at = checked_in_at
            row.notes = item.notes
            touched.append(row)
            continue

        row = AttendanceRecord(
            session_id=session_id,
            member_id=item.member_id,
            status=item.status,
            checked_in_at=checked_in_at,
            notes=item.notes,
        )
        db.add(row)
        touched.append(row)

    db.commit()

    for row in touched:
        db.refresh(row)

    return touched


def member_attendance_history(db: Session, member_id: UUID):
    rows = (
        db.query(AttendanceRecord, AttendanceSession)
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .filter(AttendanceRecord.member_id == member_id)
        .order_by(AttendanceSession.session_date.desc())
        .all()
    )

    total_sessions = db.query(func.count(AttendanceSession.id)).scalar() or 0
    present_count = sum(1 for record, _ in rows if record.status == "present")
    percentage = round((present_count / total_sessions) * 100, 2) if total_sessions else 0.0

    history = [
        {
            "session_id": session.id,
            "session_title": session.title,
            "session_date": session.session_date,
            "status": record.status,
            "notes": record.notes,
        }
        for record, session in rows
    ]
    return history, percentage


def attendance_summary(db: Session):
    total_sessions = db.query(func.count(AttendanceSession.id)).scalar() or 0

    status_counts = defaultdict(int)
    status_rows = db.query(AttendanceRecord.status, func.count(AttendanceRecord.id)).group_by(AttendanceRecord.status).all()
    for status, count in status_rows:
        status_counts[status] = count

    member_stats = (
        db.query(
            AttendanceRecord.member_id,
            func.sum(case((AttendanceRecord.status == "present", 1), else_=0)).label("present_count"),
            func.count(AttendanceRecord.id).label("record_count"),
        )
        .group_by(AttendanceRecord.member_id)
        .all()
    )

    low_attendance_members = 0
    for row in member_stats:
        ratio = (row.present_count / row.record_count) if row.record_count else 0
        if ratio < 0.5:
            low_attendance_members += 1

    return {
        "total_members": db.query(func.count(Member.id)).scalar() or 0,
        "total_sessions": total_sessions,
        "present_count": status_counts["present"],
        "absent_count": status_counts["absent"],
        "excused_count": status_counts["excused"],
        "low_attendance_members": low_attendance_members,
    }
