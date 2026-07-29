from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.crud import pastoral as pastoral_crud
from app.db.database import get_db
from app.models.member import Member
from app.schemas.pastoral import PastoralLogCreate, PastoralLogResponse, PastoralLogUpdate
from app.services.audit import record_audit

router = APIRouter()


def _serialize(row) -> dict:
    return PastoralLogResponse(
        id=row.id,
        member_id=row.member_id,
        member_name=f"{row.member.first_name} {row.member.last_name}".strip() if row.member else None,
        log_type=row.log_type,
        notes=row.notes,
        status=row.status,
        follow_up_date=row.follow_up_date,
        logged_by=row.logged_by,
        log_date=row.log_date,
        created_at=row.created_at,
    ).model_dump()


@router.get("/")
def list_pastoral_logs(
    member_id: UUID | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    rows = pastoral_crud.list_logs(db, member_id=member_id, status=status_filter)
    return {"status": "success", "data": [_serialize(row) for row in rows], "total": len(rows)}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_pastoral_log(
    payload: PastoralLogCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    if not db.query(Member).filter(Member.id == payload.member_id).first():
        raise HTTPException(status_code=404, detail="Member not found")
    row = pastoral_crud.create_log(db, payload, current_user.id)
    record_audit(db, user_id=current_user.id, action="created", table_name="pastoral_logs", record_id=row.id, new_value={"member_id": str(row.member_id), "log_type": row.log_type, "status": row.status})
    db.commit()
    return {"status": "success", "data": _serialize(row)}


@router.put("/{log_id}")
def update_pastoral_log(
    log_id: UUID,
    payload: PastoralLogUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    row = pastoral_crud.update_log(db, log_id, payload)
    if not row:
        raise HTTPException(status_code=404, detail="Pastoral log not found")
    record_audit(db, user_id=current_user.id, action="updated", table_name="pastoral_logs", record_id=log_id, new_value=payload.model_dump(exclude_unset=True))
    db.commit()
    return {"status": "success", "data": _serialize(row)}
