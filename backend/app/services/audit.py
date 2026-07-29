from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def record_audit(
    db: Session,
    *,
    user_id: UUID | None,
    action: str,
    table_name: str,
    record_id: UUID | None = None,
    old_value: dict[str, Any] | None = None,
    new_value: dict[str, Any] | None = None,
) -> AuditLog:
    entry = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        old_value=old_value,
        new_value=new_value,
    )
    db.add(entry)
    return entry
