# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# ===============================================================
"""Smoke 4 — Alembic migration applies to a fresh SQLite DB.

Per plan 12-A Derisking → Smoke 4. Validates the local-first data layer:
the 0001_initial migration creates exactly four Tier-1 tables on a fresh
SQLite file.
"""
import os
import sqlite3
import subprocess
import sys
from pathlib import Path


def test_fresh_migration_creates_all_four_tables(tmp_path: Path) -> None:
    env = os.environ.copy()
    env["APPARAE_DATA_DIR"] = str(tmp_path)
    backend_dir = Path(__file__).parents[1]
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "alembic",
            "-c",
            "app/db/alembic.ini",
            "upgrade",
            "head",
        ],
        cwd=backend_dir,
        env=env,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        f"alembic upgrade failed:\nSTDOUT:\n{result.stdout}\n"
        f"STDERR:\n{result.stderr}"
    )
    db = tmp_path / "apparae.db"
    assert db.exists(), f"DB not created at {db}"
    conn = sqlite3.connect(db)
    tables = sorted(
        r[0]
        for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' "
            "AND name NOT LIKE 'alembic%' AND name NOT LIKE 'sqlite_%'"
        ).fetchall()
    )
    expected = [
        "agent_memory",
        "build_brief",
        "conversation_turn",
        "work_item",
    ]
    assert tables == expected, f"got {tables}, want {expected}"
