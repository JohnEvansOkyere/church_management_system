"""Make family association optional in the member workflow and store referral context."""

from alembic import op
import sqlalchemy as sa


revision = "20260729_000009"
down_revision = "20260729_000008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("members", sa.Column("introduced_by", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("members", "introduced_by")
