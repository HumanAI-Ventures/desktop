# Apparae Desktop Architecture

> Two-process model — always-on daemon + on-demand UI window. Local SQLite is the
> source of truth; the shared Apparae Supabase only holds billing + telemetry
> aggregates. Per `spectre-standalone-product.md` §3.

## Pattern 2 callout

This repo is a fork of [eigent-ai/eigent](https://github.com/eigent-ai/eigent)
(Apache-2.0). Per the `eigent-integration-investigation.md` §6 verdict, we
adopt **Pattern 2 LOCK**:

- KEEP the FastAPI controllers, SSE protocol, 40+ toolkits, Electron/Tauri
  shell, React/Zustand frontend, `task_lock`, `remote_sub_agent`.
- DISCARD the CAMEL Workforce orchestrator: `workforce.py`,
  `single_agent_worker.py`, `agent_model.py`, `listen_chat_agent.py`,
  `social_media.py` factory.
- STUB the 7 remaining agent factories to `NotImplementedError`; rebuild in
  plan B as LangGraph/MCP-bridge wrappers.
- REPLACE the 2460-LoC `chat_service.step_solve()` with a thin pass-through
  to `app.runtime.sop_runtime_stub`. The real SOP-state-machine dispatcher
  lands in plan C.

## Two-process diagram

```
+------------------------------------------+
|  Customer machine                        |
|                                          |
|  +------------------------------------+  |
|  |  ALWAYS-ON: apparae-daemon         |  |
|  |  (Python / FastAPI / uvicorn)      |  |
|  |  - launchd / systemd / SCM owned   |  |
|  |  - listens 127.0.0.1:5001          |  |
|  |  - reads/writes ~/.apparae/        |  |
|  |  - reads/writes ~/Projects/<ws>/   |  |
|  |  - SQLite: apparae.db              |  |
|  +-----------+------------------------+  |
|              ^                           |
|              | local SSE / HTTP          |
|              v                           |
|  +------------------------------------+  |
|  |  ON-DEMAND: apparae-ui (Tauri)     |  |
|  |  - user launches when wanted       |  |
|  |  - closing it does NOT stop daemon |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## File-by-file inheritance

| Path | Fate | Reason |
|---|---|---|
| `backend/app/controller/` | KEEP | HTTP routing, framework-agnostic |
| `backend/app/agent/toolkit/` | KEEP (38 toolkits) | Framework-agnostic CAMEL toolkits |
| `backend/app/remote_sub_agent/` | KEEP | Pattern 2 retains foreign-agent bridge |
| `backend/app/service/task.py` | KEEP | `TaskLock` is framework-agnostic per investigation §4.6 |
| `backend/app/service/chat_service.py` | STUB | 2460-LoC step_solve() → thin SOP-runtime delegate |
| `backend/app/utils/workforce.py` | DELETE | 1098-LoC CAMEL Workforce subclass |
| `backend/app/utils/single_agent_worker.py` | DELETE | CAMEL SingleAgentWorker subclass |
| `backend/app/agent/agent_model.py` | DELETE | CAMEL ChatAgent factory wrapper |
| `backend/app/agent/listen_chat_agent.py` | DELETE | SSE-streaming ChatAgent subclass |
| `backend/app/agent/factory/social_media.py` | DELETE | CAMEL agent factory (new since 2026-05-25 audit) |
| `backend/app/agent/factory/{browser,developer,document,mcp,multi_modal,question_confirm,task_summary}.py` | STUB | Rebuilt in plan B |
| `backend/app/agent/factory/remote_sub_agent.py` | KEEP | Wraps a KEPT toolkit |
| `backend/app/db/` | NEW | Local SQLite + 4 Tier-1 tables |
| `backend/app/runtime/sop_runtime_stub.py` | NEW | Preserves SSE wire contract during Stream A |
| `src/` (React frontend) | KEEP | Reskin via `src/theme/`; chatStore.ts SSE handler unchanged |
| `electron/` | DEFERRED-SWAP | Replaced with `src-tauri/` in a follow-up commit (see BUILDING.md) |

## Cross-stream seams

- Plan B (B-mcp-bridge-wrappers): rebuilds the 7 factory stubs as
  MCP-bridge-wrapped LangGraph agents.
- Plan C (C-sop-state-machines): replaces `sop_runtime_stub.run()` with the
  real SOP A/B/C state-machine dispatcher.
- Plan D (D-onboarding-wizard): wires `src-tauri/src/workspace_picker.rs`
  into the first-launch flow.

## Source-of-truth specs

- `saas-agency/docs/prd_agency/00-roadmap.md` §5.2 Stream A scope
- `saas-agency/docs/prd_agency/01-foundations/spectre-standalone-product.md`
  §3, §4.1, §4.11
- `saas-agency/docs/prd_agency/04-v0-foundations/eigent-integration-investigation.md`
  §6, §7, §10
