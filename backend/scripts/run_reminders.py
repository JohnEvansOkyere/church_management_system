"""Run weekly SMS reminders once.

Use this script from a platform cron job every 5-15 minutes. The reminder_runs
unique constraint makes repeated cron calls safe for the same scheduled minute.
"""

from app.crud.communication import run_due_reminders
from app.db.database import SessionLocal


def main() -> None:
    db = SessionLocal()
    try:
        print(run_due_reminders(db))
    finally:
        db.close()


if __name__ == "__main__":
    main()
