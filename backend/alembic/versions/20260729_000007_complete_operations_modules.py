"""Complete SMS provider metadata, events, pastoral follow-up, and audit logs."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260729_000007"
down_revision = "20260729_000006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("communications", sa.Column("provider_message_id", sa.String(), nullable=True))
    op.add_column("communications", sa.Column("credits_used", sa.Integer(), nullable=True))

    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("start_datetime", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_datetime", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_recurring", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("recurrence_rule", sa.String(), nullable=True),
        sa.Column("max_capacity", sa.Integer(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_events_start_datetime", "events", ["start_datetime"])
    op.create_table(
        "event_registrations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("member_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
        sa.Column("registered_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("event_id", "member_id", name="uq_event_member"),
    )

    op.create_table(
        "pastoral_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("member_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
        sa.Column("log_type", sa.String(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=False),
        sa.Column("status", sa.String(), server_default="open", nullable=False),
        sa.Column("follow_up_date", sa.Date(), nullable=True),
        sa.Column("logged_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("log_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pastoral_logs_member_id", "pastoral_logs", ["member_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("table_name", sa.String(), nullable=False),
        sa.Column("record_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("old_value", postgresql.JSONB(), nullable=True),
        sa.Column("new_value", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_pastoral_logs_member_id", table_name="pastoral_logs")
    op.drop_table("pastoral_logs")
    op.drop_table("event_registrations")
    op.drop_index("ix_events_start_datetime", table_name="events")
    op.drop_table("events")
    op.drop_column("communications", "credits_used")
    op.drop_column("communications", "provider_message_id")
