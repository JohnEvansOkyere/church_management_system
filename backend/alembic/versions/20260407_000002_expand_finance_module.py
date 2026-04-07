"""Expand finance module with funds, batches, and donations

Revision ID: 20260407_000002
Revises: 20260325_000001
Create Date: 2026-04-07 12:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid


revision = "20260407_000002"
down_revision = "20260325_000001"
branch_labels = None
depends_on = None


STANDARD_FUNDS = [
    {"id": uuid.uuid4(), "name": "Tithe", "description": "Regular member tithe contributions."},
    {"id": uuid.uuid4(), "name": "Offering", "description": "General service offertory and loose collections."},
    {"id": uuid.uuid4(), "name": "Harvest", "description": "Annual harvest and thanksgiving campaign giving."},
    {"id": uuid.uuid4(), "name": "Thanksgiving", "description": "Special thanksgiving offerings."},
    {"id": uuid.uuid4(), "name": "Missions", "description": "Mission support and outreach giving."},
    {"id": uuid.uuid4(), "name": "Welfare", "description": "Member care and benevolence support fund."},
    {"id": uuid.uuid4(), "name": "Building Fund", "description": "Church building, renovation, and capital projects."},
    {"id": uuid.uuid4(), "name": "Seed", "description": "Special seed and prophetic giving."},
]


def upgrade() -> None:
    op.create_table(
        "finance_batches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("service_date", sa.Date(), nullable=False),
        sa.Column("service_type", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("is_closed", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("recorded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "donation_funds",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.UniqueConstraint("name", name="uq_donation_funds_name"),
    )

    op.create_table(
        "donations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("member_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("members.id"), nullable=True),
        sa.Column("batch_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("finance_batches.id"), nullable=True),
        sa.Column("fund_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("donation_funds.id"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(), server_default="GHS", nullable=False),
        sa.Column("payment_method", sa.String(), nullable=True),
        sa.Column("reference", sa.String(), nullable=True),
        sa.Column("donation_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    donation_funds = sa.table(
        "donation_funds",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
    )
    op.bulk_insert(donation_funds, STANDARD_FUNDS)


def downgrade() -> None:
    op.drop_table("donations")
    op.drop_table("donation_funds")
    op.drop_table("finance_batches")
