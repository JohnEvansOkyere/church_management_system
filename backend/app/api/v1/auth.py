from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_roles
from app.core.security import create_access_token
from app.crud import auth as auth_crud
from app.db.database import get_db
from app.schemas.auth import ChangePasswordRequest, LoginRequest, UserCreate, UserResponse

router = APIRouter()


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_crud.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "status": "success",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(),
        },
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("superadmin")),
):
    existing = auth_crud.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    user = auth_crud.create_user(db, payload)
    return {"status": "success", "data": UserResponse.model_validate(user).model_dump()}


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"status": "success", "data": UserResponse.model_validate(current_user).model_dump()}


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    changed = auth_crud.change_password(db, current_user, payload.current_password, payload.new_password)
    if not changed:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    return {"status": "success", "data": {"message": "Password changed successfully"}}
