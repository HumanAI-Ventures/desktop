# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# ===============================================================
"""Alembic env — uses app.db.connection.database_url_sync() as the URL source."""
import importlib.util
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# Load app.db.connection + app.db.models WITHOUT triggering app/__init__.py
# (which imports FastAPI and the whole agent surface). Alembic migrations
# need only the schema, not the running daemon.
_db_dir = Path(__file__).resolve().parent.parent  # app/db/
_backend_dir = _db_dir.parents[1]
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod


_connection = _load_module(
    "_apparae_db_connection", _db_dir / "connection.py"
)
_models = _load_module("_apparae_db_models", _db_dir / "models.py")
database_url_sync = _connection.database_url_sync
Base = _models.Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override the URL with the runtime-resolved path (honors $APPARAE_DATA_DIR).
config.set_main_option("sqlalchemy.url", database_url_sync())

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emits SQL to stdout)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode against a live engine."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
