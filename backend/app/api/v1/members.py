from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.crud import member as member_crud
from app.db.database import get_db
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate

router = APIRouter()


@router.get("/")
def list_members(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    members, total = member_crud.get_members(db, skip=skip, limit=limit, search=search, status=status_filter)
    low_map = member_crud.build_low_attendance_map(db, [m.id for m in members])

    data = []
    for m in members:
        row = MemberResponse.model_validate(m).model_dump()
        row["low_attendance"] = low_map.get(m.id, False)
        data.append(row)

    page = (skip // limit) + 1
    return {"status": "success", "data": data, "total": total, "page": page, "limit": limit}


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_member(
    payload: MemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    if payload.is_family_head and not payload.family_name and not payload.family_id:
        raise HTTPException(
            status_code=400,
            detail="family_name or family_id is required when is_family_head is true",
        )

    member = member_crud.create_member(db, payload)
    low_map = member_crud.build_low_attendance_map(db, [member.id])
    row = MemberResponse.model_validate(member).model_dump()
    row["low_attendance"] = low_map.get(member.id, False)
    return {"status": "success", "data": row}


@router.get("/family/{family_id}")
def get_family_members(
    family_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    members = member_crud.get_members_by_family(db, family_id)
    low_map = member_crud.build_low_attendance_map(db, [m.id for m in members])

    data = []
    for m in members:
        row = MemberResponse.model_validate(m).model_dump()
        row["low_attendance"] = low_map.get(m.id, False)
        data.append(row)

    return {"status": "success", "data": data}


@router.get("/export")
def export_members(
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    members, _ = member_crud.get_members(db, skip=0, limit=100000)
    csv_data = member_crud.generate_members_csv(members)
    headers = {"Content-Disposition": "attachment; filename=members.csv"}
    return StreamingResponse(iter([csv_data]), media_type="text/csv", headers=headers)


@router.get("/{member_id}")
def get_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    member = member_crud.get_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    low_map = member_crud.build_low_attendance_map(db, [member.id])
    row = MemberResponse.model_validate(member).model_dump()
    row["low_attendance"] = low_map.get(member.id, False)
    return {"status": "success", "data": row}


@router.put("/{member_id}")
def update_member(
    member_id: UUID,
    payload: MemberUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    member = member_crud.update_member(db, member_id, payload)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    low_map = member_crud.build_low_attendance_map(db, [member.id])
    row = MemberResponse.model_validate(member).model_dump()
    row["low_attendance"] = low_map.get(member.id, False)
    return {"status": "success", "data": row}


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin")),
):
    deleted = member_crud.soft_delete_member(db, member_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Member not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{member_id}/photo")
def upload_member_photo(
    member_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin", "secretary")),
):
    member = member_crud.get_member(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    uploads_dir = Path("uploads/members")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "").suffix.lower() or ".jpg"
    safe_filename = f"{member_id}_{uuid4().hex}{extension}"
    file_path = uploads_dir / safe_filename

    file_bytes = file.file.read()
    with open(file_path, "wb") as output:
        output.write(file_bytes)

    photo_url = f"/uploads/members/{safe_filename}"
    updated = member_crud.update_member(db, member_id, MemberUpdate(photo_url=photo_url))
    row = MemberResponse.model_validate(updated).model_dump()
    row["low_attendance"] = member_crud.build_low_attendance_map(db, [member_id]).get(member_id, False)
    return {"status": "success", "data": row}
