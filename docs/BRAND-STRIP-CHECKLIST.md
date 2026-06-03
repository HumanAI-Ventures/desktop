# Brand-Strip Checklist (Eigent → Apparae)

> Per plan 12-A Task 2. Tracks every "Eigent" string that needs replacing.
> Legend: `[x]` = done, `[ ]` = pending, `[KEEP]` = legally retained
> (Apache-2.0 §4 NOTICE) or historical (CHANGELOG entries).

## Stream A — shipped in initial Pattern-2 surgery commit

- [x] `package.json` — name, description, author, license (Apache-2.0)
- [x] `electron-builder.json` — productName, appId, OAuth protocol scheme,
      publish target, CFBundleURLName/Schemes
- [x] `backend/pyproject.toml` — package name `apparae-daemon`
- [x] `backend/main.py` — "Starting Apparae Agency Daemon API" log line
- [x] `backend/app/__init__.py` — FastAPI title

## Stream A — deferred to follow-up commits (large surface, low-risk)

These are the bulk of the brand surface — i18n strings, Storybook content,
README copy, and React component constants. They MUST be done before any
signed installer ships, but they're low-risk for a daemon-only smoke (no
customer sees them yet) and benefit from a single bulk pass.

- [ ] `src/i18n/locales/<lang>/{agents,chat,dashboard,layout,setting}.json`
      — 10 locales × ~5 files. Bulk `sed -i` keyed on `"Eigent"` and
      `"eigent"` with manual review per language for context.
- [ ] `src/**/*.tsx` — header/footer literal strings, ToastTitle constants,
      Settings panel headers, Login provider labels
- [ ] `README.md` + `README_*.md` (CN/JA/PT-BR localized READMEs) —
      full Apparae rewrite. Current Eigent README ~22KB.
- [ ] `electron/main/*.ts` — Electron app lifecycle bootstrap strings
      (will be removed when Tauri swap lands)
- [ ] `.storybook/preview.tsx` + storybook chrome — brand-name story chips
- [ ] `entitlements.mac.plist` — `com.eigent.app` → `com.apparae.agency`
      in Apple bundle URL types (mirrors the electron-builder.json change)
- [ ] Welcome screen + Onboarding screens — handled by plan D
- [ ] `backend/messages.pot` + `backend/lang/*.po` — backend i18n strings

## KEEP entries (do not strip)

- [KEEP] `LICENSE` — original Apache-2.0 license text (verbatim)
- [KEEP] `licenses/eigent-NOTICE` — Apache-2.0 §4 NOTICE preserving
        Eigent copyright
- [KEEP] `licenses/license_template_{py,ts}.txt` — Eigent's own license-
        header generator; keeps the copyright trail visible per §4
- [KEEP] CHANGELOG entries that reference historical Eigent releases
- [KEEP] `# ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved.`
        header in untouched KEEP files — derivative work attribution

## Smoke 2 gate

PR CI must enforce that the file globs `src/`, `src-tauri/src/`,
`backend/app/` produce zero ripgrep hits for `Eigent` (case-insensitive)
excluding the KEEP allowlist above. See `ci/.github/workflows/pr-checks.yml`
(Task 11, not yet shipped) — until that lands, run by hand:

```bash
rg -i "eigent" --type ts --type tsx --type rs --type py \
  src/ backend/app/ \
  --glob '!**/licenses/**' --glob '!**/eigent-NOTICE' \
  --glob '!**/CHANGELOG.md'
```

Expected: 0 hits after the deferred bulk pass lands.
