"""add expert verification fields

Revision ID: c7e2f9b4d8a1
Revises: 10896763e934
Create Date: 2026-05-19 18:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c7e2f9b4d8a1"
down_revision: Union[str, Sequence[str], None] = "10896763e934"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("expert_profiles", sa.Column("experience_years", sa.Integer(), nullable=True))
    op.add_column("expert_profiles", sa.Column("verification_document_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("expert_profiles", "verification_document_url")
    op.drop_column("expert_profiles", "experience_years")
