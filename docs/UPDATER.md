# Apparae Auto-Update Contract

> Per plan 12-A Task 10. v1 design pending Tauri-shell swap.

## Manifest JSON schema

The updater polls a public manifest at
`https://apparae-updates.apparae.com/<channel>/latest.json` and compares its
`version` against the local `__version__` in `backend/app/__init__.py`.

```json
{
  "version": "0.0.2",
  "platforms": {
    "darwin-x86_64":  { "signature": "<base64 ed25519>", "url": "..." },
    "darwin-aarch64": { "signature": "<base64 ed25519>", "url": "..." },
    "linux-x86_64":   { "signature": "<base64 ed25519>", "url": "..." },
    "windows-x86_64": { "signature": "<base64 ed25519>", "url": "..." }
  }
}
```

## Channels

| Channel | Audience | Cadence |
|---|---|---|
| `stable` | All production customers | Manual cut on a tagged release |
| `beta`   | Opt-in early adopters | Same artifact pushed N days before `stable` |
| `test`   | CI-only; never picked up by `stable` clients | Per-PR validation runs |

## Signing matrix

| Bundle | Signing tool | Output |
|---|---|---|
| `.dmg` (macOS) | Apple `notarytool` + `stapler` | Embedded notarization receipt |
| `.AppImage` / `.deb` (Linux) | `cosign sign-blob` | Detached `.sig` |
| `.msi` (Windows) | `signtool sign /tr <DigiCert> /fd sha256` | Authenticode embedded |
| Tauri update bundle | `tauri signer sign` (ed25519) | Detached `.sig` for the updater |

## Polling cadence

- Default: every 6h (controlled by `tauri-plugin-updater`'s scheduler)
- Force-trigger: `POST http://127.0.0.1:5001/internal/check-update`
  (Smoke 6's hook — bypasses the 6h backoff)

## Rollback

If `vN+1` is broken, the on-call action is:

1. Re-publish `latest.json` pointing at the `vN` bundles already on the CDN.
2. **Bump the version field** to `vN+0.0.1` (e.g. `0.0.5` → `0.0.5-rollback.1`)
   so clients see "newer" and re-fetch.
3. Wait one poll cycle (≤6h) for fleet to drain.

NEVER edit `vN+1` artifacts in place — clients that already downloaded
won't re-fetch unless `version` increases.

## Deferred from Stream A

The following land when the Tauri shell swap lands:

- `src-tauri/src/updater.rs` (Rust `tauri-plugin-updater` wiring)
- `ci/scripts/publish-manifest.py` (R2 upload + cache invalidation)
- `/internal/check-update` FastAPI endpoint (Smoke 6 trigger)

Until then, this doc serves as the spec; auto-updates are NOT live on the
fork until Stream A's Tauri-swap follow-up ships.
