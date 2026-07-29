"""Add church departments and recurring SMS reminders.

Departments are intentionally flat: each record is one complete ministry/team.
"""

import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260729_000006"
down_revision = "20260407_000005"
branch_labels = None
depends_on = None


DEPARTMENTS = [
    ("Ushering", "Sanctuary Keepers and Sanctuary Greeters."),
    ("Springs Harmony Choir", "Music ministry for worship, praise, and ministration."),
    ("Protocol Ministry", "Protocol and service coordination ministry."),
    ("Media, ICT & Publicity Ministry", "Media, ICT, communications, and publicity ministry."),
    ("King's Kids Ministry", "Sunday School and children's ministry."),
    ("GenNext", "Youth ministry."),
    ("Battle Axe", "Intercessory ministry."),
    ("Crowns of Glory", "Women's ministry."),
    ("Men of Honour", "Men's ministry."),
    ("Car Park Ministry", "Car park and arrival support ministry."),
]


def upgrade() -> None:
    op.create_table(
        "groups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("leader_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("members.id"), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name", name="uq_groups_name"),
    )
    op.create_table(
        "group_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("groups.id", ondelete="CASCADE"), nullable=False),
        sa.Column("member_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("members.id", ondelete="CASCADE"), nullable=False),
        sa.Column("joined_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("group_id", "member_id", name="uq_group_member"),
    )
    op.create_index("ix_group_members_group_id", "group_members", ["group_id"])
    op.create_index("ix_group_members_member_id", "group_members", ["member_id"])

    groups = sa.table(
        "groups",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
    )
    op.bulk_insert(
        groups,
        [{"id": uuid.uuid4(), "name": name, "description": description} for name, description in DEPARTMENTS],
    )

    op.create_table(
        "communications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("type", sa.String(), server_default="sms", nullable=False),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("audience_type", sa.String(), nullable=True),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("recipients", sa.Text(), nullable=True),
        sa.Column("recipient_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("successful_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("failed_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("sent_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("status", sa.String(), server_default="queued", nullable=False),
    )
    op.create_index("ix_communications_sent_at", "communications", ["sent_at"])

    op.create_table(
        "reminder_schedules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("message_template", sa.Text(), nullable=False),
        sa.Column("frequency", sa.String(), server_default="weekly", nullable=False),
        sa.Column("weekday", sa.Integer(), nullable=False),
        sa.Column("send_time", sa.Time(), nullable=False),
        sa.Column("timezone", sa.String(), server_default="Africa/Accra", nullable=False),
        sa.Column("audience_type", sa.String(), server_default="all_members", nullable=False),
        sa.Column("group_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("groups.id"), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "reminder_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("schedule_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("reminder_schedules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scheduled_for", sa.DateTime(timezone=True), nullable=False),
        sa.Column("communication_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("communications.id"), nullable=True),
        sa.Column("status", sa.String(), server_default="running", nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("schedule_id", "scheduled_for", name="uq_reminder_schedule_run"),
    )


def downgrade() -> None:
    op.drop_table("reminder_runs")
    op.drop_table("reminder_schedules")
    op.drop_index("ix_communications_sent_at", table_name="communications")
    op.drop_table("communications")
    op.drop_index("ix_group_members_member_id", table_name="group_members")
    op.drop_index("ix_group_members_group_id", table_name="group_members")
    op.drop_table("group_members")
    op.drop_table("groups")
