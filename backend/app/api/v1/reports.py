from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud import reports as reports_crud
from app.db.database import get_db

router = APIRouter()


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = reports_crud.get_dashboard_stats(db)
    return {"status": "success", "data": data}


@router.get("/attendance/monthly")
def attendance_monthly(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = reports_crud.get_attendance_monthly(db, months=6)
    return {"status": "success", "data": data}


@router.get("/donations/monthly")
def donations_monthly(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = reports_crud.get_donations_monthly(db, months=6)
    return {"status": "success", "data": data}


@router.get("/members/growth")
def members_growth(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = reports_crud.get_members_growth(db, months=6)
    return {"status": "success", "data": data}


@router.get("/export/members")
def export_members_report(current_user=Depends(get_current_user)):
    return {"status": "success", "data": {"message": "Members export endpoint placeholder"}}


@router.get("/export/donations")
def export_donations_report(current_user=Depends(get_current_user)):
    return {"status": "success", "data": {"message": "Donations export endpoint placeholder"}}
