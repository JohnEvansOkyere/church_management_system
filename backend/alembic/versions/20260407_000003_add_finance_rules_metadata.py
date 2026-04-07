"""Add finance fund metadata for church recording rules

Revision ID: 20260407_000003
Revises: 20260407_000002
Create Date: 2026-04-07 13:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260407_000003"
down_revision = "20260407_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("donation_funds", sa.Column("code", sa.String(), nullable=True))
    op.add_column("donation_funds", sa.Column("requires_member", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.create_unique_constraint("uq_donation_funds_code", "donation_funds", ["code"])

    op.execute("UPDATE donation_funds SET code = 'tithe', requires_member = true WHERE lower(name) = 'tithe'")
    op.execute("UPDATE donation_funds SET code = 'offering' WHERE lower(name) = 'offering'")
    op.execute("UPDATE donation_funds SET code = 'harvest' WHERE lower(name) = 'harvest'")
    op.execute("UPDATE donation_funds SET code = 'thanksgiving' WHERE lower(name) = 'thanksgiving'")
    op.execute("UPDATE donation_funds SET code = 'missions' WHERE lower(name) = 'missions'")
    op.execute("UPDATE donation_funds SET code = 'welfare' WHERE lower(name) = 'welfare'")
    op.execute("UPDATE donation_funds SET code = 'building_fund' WHERE lower(name) = 'building fund'")
    op.execute("UPDATE donation_funds SET code = 'seed' WHERE lower(name) = 'seed'")


def downgrade() -> None:
    op.drop_constraint("uq_donation_funds_code", "donation_funds", type_="unique")
    op.drop_column("donation_funds", "requires_member")
    op.drop_column("donation_funds", "code")
