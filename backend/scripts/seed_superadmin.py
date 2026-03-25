import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session

from app.crud import auth as auth_crud
from app.db.database import SessionLocal
from app.schemas.auth import UserCreate


def seed_superadmin(db: Session) -> None:
    email = os.getenv("SUPERADMIN_EMAIL", "admin@livingspring.org")
    password = os.getenv("SUPERADMIN_PASSWORD", "ChangeMe123!")

    existing = auth_crud.get_user_by_email(db, email)
    if existing:
        print(f"Superadmin already exists: {email}")
        return

    user = auth_crud.create_user(
        db,
        UserCreate(
            email=email,
            password=password,
            role="superadmin",
            member_id=None,
        ),
    )
    print(f"Created superadmin: {user.email}")


def main() -> None:
    db = SessionLocal()
    try:
        seed_superadmin(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
