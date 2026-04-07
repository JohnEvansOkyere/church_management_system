"""Add attendance session start time for punctuality tracking

Revision ID: 20260407_000004
Revises: 20260407_000003
Create Date: 2026-04-07 14:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260407_000004"
down_revision = "20260407_000003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("attendance_sessions", sa.Column("session_start_time", sa.Time(), nullable=True))

    op.execute(
        """
        UPDATE attendance_sessions
        SET session_start_time =
            CASE
                WHEN lower(coalesce(session_type, '')) = 'sunday_service' THEN TIME '08:00:00'
                WHEN lower(coalesce(session_type, '')) = 'midweek' THEN TIME '18:00:00'
                WHEN lower(coalesce(session_type, '')) = 'prayer' THEN TIME '18:00:00'
                WHEN lower(coalesce(session_type, '')) = 'special' THEN TIME '09:00:00'
                ELSE TIME '09:00:00'
            END
        WHERE session_start_time IS NULL
        """
    )


def downgrade() -> None:
    op.drop_column("attendance_sessions", "session_start_time")
