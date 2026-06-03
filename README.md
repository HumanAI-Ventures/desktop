# Apparae Desktop

> Autonomous AI companies, on your machine.

This repo is the desktop client for [Apparae](https://getapparae.com) (HumanAI
Ventures). It is a fork of the Apache-2.0-licensed
[eigent-ai/eigent](https://github.com/eigent-ai/eigent) project, reshaped per
Pattern 2 of `docs/prd_agency/04-v0-foundations/eigent-integration-investigation.md`.

What that means in practice:

- We retain Eigent's FastAPI backend, SSE wire protocol, 38 framework-agnostic
  toolkits, Tauri/Electron shell, and React/Zustand frontend.
- We replace Eigent's CAMEL Workforce orchestrator with HumanAI Ventures'
  own SOP-runtime state machines + LangGraph role agents.
- We re-skin the surface as Apparae and ship signed installers for macOS,
  Linux, and Windows.

The original Eigent copyright is preserved per Apache-2.0 §4 — see
`LICENSE` and `licenses/eigent-NOTICE`.

## Documentation

- `docs/ARCHITECTURE.md` — two-process model + file-by-file fate table
- `docs/BUILDING.md` — per-OS prereqs + dev commands
- `docs/UPDATER.md` — auto-update manifest schema + signing matrix
- `docs/BRAND-STRIP-CHECKLIST.md` — Eigent → Apparae rename tracker

## Quickstart

```bash
cd backend
uv sync
uv run python -m alembic -c app/db/alembic.ini upgrade head
uv run uvicorn main:api --port 5001
# then in another shell:
curl http://127.0.0.1:5001/healthz   # → {"status":"ok"}
```

## License

Apache-2.0. See `LICENSE`.
