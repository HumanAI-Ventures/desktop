# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# ===============================================================
"""Local SQLite connection bound to ~/.apparae/apparae.db.

Per spectre-standalone-product.md §3: every customer's agency state lives
on their own machine. The shared Supabase only holds billing + opt-in
telemetry aggregates. SQLite is the source of truth for Build Brief,
Work Items, AgentMemory, ConversationTurn.

Honors $APPARAE_DATA_DIR override so tests can point at a tmp path
without polluting the real ~/.apparae/ dir.
"""
import os
from pathlib import Path


def data_dir() -> Path:
    """Return the customer-local data dir; honors $APPARAE_DATA_DIR for tests."""
    override = os.environ.get("APPARAE_DATA_DIR")
    if override:
        return Path(override)
    return Path.home() / ".apparae"


def db_path() -> Path:
    d = data_dir()
    d.mkdir(parents=True, exist_ok=True)
    return d / "apparae.db"


def database_url() -> str:
    """SQLAlchemy URL for the local SQLite DB (async driver)."""
    return f"sqlite+aiosqlite:///{db_path()}"


def database_url_sync() -> str:
    """Synchronous SQLAlchemy URL (Alembic uses this for migrations)."""
    return f"sqlite:///{db_path()}"
