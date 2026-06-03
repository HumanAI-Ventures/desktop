# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# ===============================================================
"""initial schema: four Tier-1 tables.

Per plan 12-A Task 5 + spectre-standalone-product.md §3:
  build_brief, work_item, agent_memory, conversation_turn.

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-02
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "build_brief",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("workspace_path", sa.String(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "work_item",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "build_brief_id",
            sa.String(),
            sa.ForeignKey("build_brief.id"),
            nullable=False,
        ),
        sa.Column("state", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("sop", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "agent_memory",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("agent_slug", sa.String(), nullable=False),
        sa.Column("layer", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_table(
        "conversation_turn",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column(
            "work_item_id",
            sa.String(),
            sa.ForeignKey("work_item.id"),
            nullable=True,
        ),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("agent_slug", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("conversation_turn")
    op.drop_table("agent_memory")
    op.drop_table("work_item")
    op.drop_table("build_brief")
