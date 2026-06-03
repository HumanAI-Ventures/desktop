# Building Apparae

> Per plan 12-A. v1 build path runs the inherited Electron stack; the Tauri
> swap lands in a follow-up commit so this README + the build matrix can
> be exercised end-to-end first.

## Per-OS prereqs

| OS | Prereqs |
|---|---|
| macOS 11+ | Xcode CLI tools, Node ≥ 20, pnpm ≥ 9, Python 3.11 via uv |
| Ubuntu 22.04+ | `build-essential`, `libgtk-3-dev`, `libwebkit2gtk-4.1-dev`, Node ≥ 20, pnpm ≥ 9, Python 3.11 via uv |
| Windows 11 + WSL2 | Visual Studio Build Tools 2022, Node ≥ 20, pnpm ≥ 9, Python 3.11 via uv |

All three: Rust toolchain (`rustup`) once the Tauri swap lands.

## Backend (Python / FastAPI / SQLite)

```bash
cd backend
uv sync
# Apply DB migrations — creates ~/.apparae/apparae.db
uv run python -m alembic -c app/db/alembic.ini upgrade head
# Run the daemon
uv run uvicorn main:api --port 5001
# Smoke
curl http://127.0.0.1:5001/healthz   # → {"status":"ok"}
curl http://127.0.0.1:5001/version   # → {"version":"0.0.1"}
```

## Frontend (React / Vite / Electron — pre-Tauri-swap)

```bash
pnpm install
pnpm dev   # Vite dev server on http://localhost:5173
```

## SQLite location override (testing)

```bash
APPARAE_DATA_DIR=/tmp/apparae-test uv run python -m alembic -c app/db/alembic.ini upgrade head
# DB lands at /tmp/apparae-test/apparae.db
```

## OS service registration (manual smoke — does NOT replace installer)

| OS | Command |
|---|---|
| macOS | `bash installer/macos/postinstall.sh` |
| Linux | `bash installer/linux/postinst` |
| Windows (admin) | `powershell -ExecutionPolicy Bypass -File installer\windows\service-install.ps1` |

Verify on each: `curl http://127.0.0.1:5001/healthz` returns OK after a
process restart.

## Open items (gated on Tauri swap + CI infra)

- `tauri build` + `electron-builder` swap — installer matrix per OS
- `tauri-plugin-updater` integration + signing keypair procurement
- Apple Developer ID + EV Authenticode + cosign keypair procurement
  (per Open Question 2 — handled by Stream F; do NOT ship signed installers
   until those land)
