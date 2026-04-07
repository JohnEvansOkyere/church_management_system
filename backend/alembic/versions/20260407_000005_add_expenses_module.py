"""Add finance expenses module

Revision ID: 20260407_000005
Revises: 20260407_000004
Create Date: 2026-04-07 15:00:00
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid


revision = "20260407_000005"
down_revision = "20260407_000004"
branch_labels = None
depends_on = None


STANDARD_EXPENSE_CATEGORIES = [
    {"id": uuid.uuid4(), "name": "Utilities", "description": "Power, water, internet, and recurring facility bills."},
    {"id": uuid.uuid4(), "name": "Welfare", "description": "Member welfare, benevolence, and support spending."},
    {"id": uuid.uuid4(), "name": "Missions", "description": "Mission work, outreach, and evangelism spending."},
    {"id": uuid.uuid4(), "name": "Maintenance", "description": "Church equipment, facility repairs, and upkeep."},
    {"id": uuid.uuid4(), "name": "Programs", "description": "Program logistics, events, and service materials."},
    {"id": uuid.uuid4(), "name": "Payroll", "description": "Staff, stipends, and ministry honorarium payments."},
]


def upgrade() -> None:
    op.create_table(
        "expense_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.UniqueConstraint("name", name="uq_expense_categories_name"),
    )

    op.create_table(
        "expenses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("expense_categories.id"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("currency", sa.String(), server_default="GHS", nullable=False),
        sa.Column("payment_method", sa.String(), nullable=True),
        sa.Column("reference", sa.String(), nullable=True),
        sa.Column("vendor_name", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("recorded_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    expense_categories = sa.table(
        "expense_categories",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("name", sa.String()),
        sa.column("description", sa.Text()),
    )
    op.bulk_insert(expense_categories, STANDARD_EXPENSE_CATEGORIES)


def downgrade() -> None:
    op.drop_table("expenses")
    op.drop_table("expense_categories")
