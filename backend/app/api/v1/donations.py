from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.crud import donation as donation_crud
from app.db.database import get_db
from app.schemas.donation import DonationCreate, DonationFundCreate, DonationFundResponse, DonationResponse

router = APIRouter()


def serialize_donation(row) -> dict:
    data = DonationResponse.model_validate(row).model_dump()
    data["fund_name"] = row.fund.name if row.fund else None
    return data


@router.get("/")
def list_donations(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    rows, total = donation_crud.list_donations(db, skip=skip, limit=limit)
    page = (skip // limit) + 1
    return {"status": "success", "data": [serialize_donation(row) for row in rows], "total": total, "page": page, "limit": limit}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: DonationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    row = donation_crud.create_donation(db, payload, recorded_by=current_user.id)
    return {"status": "success", "data": serialize_donation(row)}


@router.get("/funds")
def list_funds(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = donation_crud.list_funds(db)
    return {"status": "success", "data": [DonationFundResponse.model_validate(row).model_dump() for row in rows]}


@router.post("/funds", status_code=status.HTTP_201_CREATED)
def create_fund(
    payload: DonationFundCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin")),
):
    row = donation_crud.create_fund(db, payload)
    return {"status": "success", "data": DonationFundResponse.model_validate(row).model_dump()}


@router.get("/member/{member_id}")
def get_member_history(
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in {"superadmin", "finance"} and str(current_user.member_id) != str(member_id):
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    rows = donation_crud.member_history(db, member_id)
    return {"status": "success", "data": [serialize_donation(row) for row in rows]}


@router.get("/reports/monthly")
def monthly_report(
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    return {"status": "success", "data": donation_crud.monthly_report(db, year=year)}


@router.get("/reports/annual")
def annual_report(
    year: int | None = Query(default=None, ge=2000, le=2100),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    return {"status": "success", "data": donation_crud.annual_report(db, year=year)}


@router.get("/member/{member_id}/statement")
def member_statement(
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    rows = donation_crud.member_history(db, member_id)
    total = sum(float(row.amount) for row in rows)
    return {
        "status": "success",
        "data": {
            "member_id": member_id,
            "generated_on": date.today().isoformat(),
            "total": total,
            "items": [serialize_donation(row) for row in rows],
        },
    }


@router.get("/{donation_id}")
def get_donation(
    donation_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "finance")),
):
    row = donation_crud.get_donation(db, donation_id)
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
    return {"status": "success", "data": serialize_donation(row)}
