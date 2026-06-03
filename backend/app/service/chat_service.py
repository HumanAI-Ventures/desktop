# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Original work © 2025-2026 Eigent.ai (Apache-2.0); see LICENSE + licenses/eigent-NOTICE.
# Pattern-2 surgery per docs/prd_agency_plans/12-v0-eigent-pattern2-surgery/
# A-eigent-fork-pattern2-surgery.md Task 6: the 2460-LoC CAMEL-Workforce-
# driven step_solve() is replaced with a thin pass-through to
# app.runtime.sop_runtime_stub. The real SOP-state-machine dispatcher lands
# in plan C (C-sop-state-machines).
# ========================================================================

"""Chat service — STUB during Stream A.

Preserves the SSE wire contract documented in eigent-integration-investigation.md
§4.8. `step_solve()` is the load-bearing entry point invoked by
controller/chat_controller.py::chat(); breaking its signature or its SSE
event shape blacks out the entire React frontend.

Stream A behavior: yield exactly two events for any /chat request:
  data: {"step": "PENDING_SOP_RUNTIME", ...}\n\n
  data: {"step": "END", ...}\n\n

Plan B (B-mcp-bridge-wrappers) rebuilds the agent factory layer.
Plan C (C-sop-state-machines) replaces this stub with the real dispatcher.
"""
import logging
from collections.abc import AsyncIterator

from fastapi import Request

from app.runtime import sop_runtime_stub
from app.service.task import TaskLock
from app.utils.server.sync_step import sync_step

logger = logging.getLogger("chat_service")


@sync_step
async def step_solve(
    options, request: Request, task_lock: TaskLock
) -> AsyncIterator[str]:
    """Dispatch a /chat request to the SOP runtime.

    STUB until plan C (C-sop-state-machines) lands. Yields two SSE events
    (PENDING_SOP_RUNTIME, END) and returns.

    Args:
        options: Chat configuration (Pydantic Chat model from app.model.chat).
            We accept Any here so the import surface stays minimal during
            Stream A; plan C tightens this back to ``Chat``.
        request: FastAPI request object (unused in stub; preserved for
            signature compatibility with controller/chat_controller.py).
        task_lock: Project-scoped TaskLock (unused in stub; preserved).

    Yields:
        SSE-formatted byte strings (each ``data: {...}\\n\\n``) parsed by
        the React frontend's chatStore.ts.
    """
    task_id = getattr(options, "task_id", None) or getattr(options, "id", "stub")
    logger.info(
        "step_solve invoked (Stream-A stub)",
        extra={"task_id": task_id},
    )
    async for evt in sop_runtime_stub.run(str(task_id), {}):
        yield evt
