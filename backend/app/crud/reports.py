from calendar import month_abbr
from datetime import date, timedelta

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord, AttendanceSession
from app.models.member import Member


def _month_start(dt: date) -> date:
    return date(dt.year, dt.month, 1)


def _add_months(dt: date, months: int) -> date:
    year = dt.year + ((dt.month - 1 + months) // 12)
    month = ((dt.month - 1 + months) % 12) + 1
    return date(year, month, 1)


def _month_label(dt: date) -> str:
    return f"{month_abbr[dt.month]} {str(dt.year)[-2:]}"


def _low_attendance_count(db: Session) -> int:
    cutoff = date.today() - timedelta(days=30)

    rows = (
        db.query(
            Member.id.label("member_id"),
            func.max(AttendanceSession.session_date).label("last_present_date"),
        )
        .outerjoin(AttendanceRecord, AttendanceRecord.member_id == Member.id)
        .outerjoin(
            AttendanceSession,
            and_(
                AttendanceSession.id == AttendanceRecord.session_id,
                AttendanceRecord.status == "present",
            ),
        )
        .group_by(Member.id)
        .all()
    )

    return sum(1 for row in rows if row.last_present_date is None or row.last_present_date <= cutoff)


def get_dashboard_stats(db: Session) -> dict:
    today = date.today()
    month_start = _month_start(today)

    total_members = db.query(func.count(Member.id)).scalar() or 0
    new_members_this_month = (
        db.query(func.count(Member.id))
        .filter(Member.date_joined.isnot(None), Member.date_joined >= month_start)
        .scalar()
        or 0
    )

    last_sunday = today - timedelta(days=(today.weekday() + 1) % 7)
    present_last_sunday = (
        db.query(func.count(AttendanceRecord.id))
        .join(AttendanceSession, AttendanceSession.id == AttendanceRecord.session_id)
        .filter(AttendanceSession.session_date == last_sunday, AttendanceRecord.status == "present")
        .scalar()
        or 0
    )

    if present_last_sunday == 0:
        latest_session_date = db.query(func.max(AttendanceSession.session_date)).scalar()
        if latest_session_date:
            present_last_sunday = (
                db.query(func.count(AttendanceRecord.id))
                .join(AttendanceSession, AttendanceSession.id == AttendanceRecord.session_id)
                .filter(AttendanceSession.session_date == latest_session_date, AttendanceRecord.status == "present")
                .scalar()
                or 0
            )

    attendance_percentage = round((present_last_sunday / total_members) * 100, 2) if total_members else 0

    return {
        "total_members": total_members,
        "new_members_this_month": new_members_this_month,
        "attendance_last_sunday": present_last_sunday,
        "attendance_percentage": attendance_percentage,
        "donations_this_month": 0.0,
        "donations_this_year": 0.0,
        "low_attendance_members": _low_attendance_count(db),
        "upcoming_events": 0,
    }


def get_attendance_monthly(db: Session, months: int = 6) -> list[dict]:
    today = date.today()
    start = _add_months(_month_start(today), -(months - 1))

    rows = (
        db.query(
            func.date_trunc("month", AttendanceSession.session_date).label("month"),
            func.count(AttendanceRecord.id).label("present_count"),
        )
        .join(AttendanceSession, AttendanceSession.id == AttendanceRecord.session_id)
        .filter(AttendanceRecord.status == "present", AttendanceSession.session_date >= start)
        .group_by(func.date_trunc("month", AttendanceSession.session_date))
        .all()
    )

    row_map = {date(r.month.year, r.month.month, 1): int(r.present_count) for r in rows}

    data = []
    for i in range(months):
        month = _add_months(start, i)
        data.append({"month": _month_label(month), "value": row_map.get(month, 0)})
    return data


def get_members_growth(db: Session, months: int = 6) -> list[dict]:
    today = date.today()
    start = _add_months(_month_start(today), -(months - 1))

    data = []
    running_total = (
        db.query(func.count(Member.id))
        .filter(Member.date_joined.isnot(None), Member.date_joined < start)
        .scalar()
        or 0
    )

    for i in range(months):
        month_start = _add_months(start, i)
        next_month = _add_months(month_start, 1)
        added = (
            db.query(func.count(Member.id))
            .filter(Member.date_joined.isnot(None), Member.date_joined >= month_start, Member.date_joined < next_month)
            .scalar()
            or 0
        )
        running_total += added
        data.append({"month": _month_label(month_start), "value": int(running_total)})

    return data
