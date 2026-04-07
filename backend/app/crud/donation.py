from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.donation import Donation, DonationFund
from app.schemas.donation import DonationCreate, DonationFundCreate


def list_donations(db: Session, skip: int = 0, limit: int = 20) -> tuple[list[Donation], int]:
    query = db.query(Donation)
    total = query.count()
    rows = query.order_by(Donation.donation_date.desc(), Donation.created_at.desc()).offset(skip).limit(limit).all()
    return rows, total


def get_donation(db: Session, donation_id: UUID) -> Donation | None:
    return db.query(Donation).filter(Donation.id == donation_id).first()


def create_donation(db: Session, payload: DonationCreate, recorded_by: UUID | None) -> Donation:
    donation = Donation(**payload.model_dump(), recorded_by=recorded_by)
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


def list_funds(db: Session) -> list[DonationFund]:
    return db.query(DonationFund).order_by(DonationFund.name.asc()).all()


def create_fund(db: Session, payload: DonationFundCreate) -> DonationFund:
    fund = DonationFund(**payload.model_dump())
    db.add(fund)
    db.commit()
    db.refresh(fund)
    return fund


def member_history(db: Session, member_id: UUID) -> list[Donation]:
    return (
        db.query(Donation)
        .filter(Donation.member_id == member_id)
        .order_by(Donation.donation_date.desc(), Donation.created_at.desc())
        .all()
    )


def monthly_report(db: Session, year: int | None = None) -> list[dict]:
    year = year or date.today().year
    rows = (
        db.query(
            extract("month", Donation.donation_date).label("month"),
            func.coalesce(func.sum(Donation.amount), 0).label("total_amount"),
        )
        .filter(extract("year", Donation.donation_date) == year)
        .group_by(extract("month", Donation.donation_date))
        .order_by(extract("month", Donation.donation_date))
        .all()
    )
    return [{"month": int(row.month), "value": float(row.total_amount)} for row in rows]


def annual_report(db: Session, year: int | None = None) -> dict:
    year = year or date.today().year
    total = (
        db.query(func.coalesce(func.sum(Donation.amount), Decimal("0.00")))
        .filter(extract("year", Donation.donation_date) == year)
        .scalar()
    )
    by_fund = (
        db.query(DonationFund.name, func.coalesce(func.sum(Donation.amount), 0).label("total_amount"))
        .join(Donation, Donation.fund_id == DonationFund.id)
        .filter(extract("year", Donation.donation_date) == year)
        .group_by(DonationFund.name)
        .order_by(DonationFund.name.asc())
        .all()
    )
    return {
        "year": year,
        "total": float(total or 0),
        "funds": [{"fund": row.name, "value": float(row.total_amount)} for row in by_fund],
    }


def donation_totals(db: Session) -> dict:
    today = date.today()
    month_total = (
        db.query(func.coalesce(func.sum(Donation.amount), Decimal("0.00")))
        .filter(
            extract("year", Donation.donation_date) == today.year,
            extract("month", Donation.donation_date) == today.month,
        )
        .scalar()
    )
    year_total = (
        db.query(func.coalesce(func.sum(Donation.amount), Decimal("0.00")))
        .filter(extract("year", Donation.donation_date) == today.year)
        .scalar()
    )
    return {
        "donations_this_month": float(month_total or 0),
        "donations_this_year": float(year_total or 0),
    }
