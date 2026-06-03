# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# ===============================================================
"""Local SQLite schema — Tier-1 contract per spectre-standalone-product.md §3.

Four tables: build_brief, work_item, agent_memory, conversation_turn.
Cross-customer aggregates live in Apparae's shared Supabase, NOT here.

Plan B will extend this with role-specific tables; plan C wires the
work_item state-machine transitions to real SOP dispatch.
"""
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


def _now() -> datetime:
    return datetime.now(timezone.utc)


class BuildBrief(Base):
    __tablename__ = "build_brief"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    workspace_path: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_now, onupdate=_now
    )


class WorkItem(Base):
    __tablename__ = "work_item"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    build_brief_id: Mapped[str] = mapped_column(
        ForeignKey("build_brief.id")
    )
    state: Mapped[str] = mapped_column(String, nullable=False)
    # SOP A/B/C state-machine label (see C-sop-state-machines)
    title: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(Text, default="")
    sop: Mapped[str] = mapped_column(String, nullable=False)
    # "A" | "B" | "C"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_now, onupdate=_now
    )


class AgentMemory(Base):
    __tablename__ = "agent_memory"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    agent_slug: Mapped[str] = mapped_column(String, nullable=False)
    layer: Mapped[str] = mapped_column(String, nullable=False)
    # "tier1_lesson" | "tier2_episodic" | "tier3_semantic"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class ConversationTurn(Base):
    __tablename__ = "conversation_turn"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    work_item_id: Mapped[str | None] = mapped_column(
        ForeignKey("work_item.id"), nullable=True
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    # "human" | "agent" | "tool"
    agent_slug: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
