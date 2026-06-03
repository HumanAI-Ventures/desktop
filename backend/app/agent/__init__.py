# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Original work © 2025-2026 Eigent.ai (Apache-2.0).
# Pattern-2 surgery per plan 12-A Task 6: the CAMEL Workforce agent surface
# is gutted. Real role-agent factories rebuilt in plan B.
# ===============================================================

"""Agent package — Pattern-2 stub layer.

The CAMEL agent_model + ListenChatAgent + 8 agent factories were the heart
of Eigent's Workforce orchestration. Pattern 2 (per
eigent-integration-investigation.md §6) discards them in favor of our own
SOP-runtime + role-agent stack.

This package now only re-exports stub factories (which raise
NotImplementedError) so consuming code's import-graph survives Stream A.
Real implementations land in plan B (B-mcp-bridge-wrappers).
"""

from app.agent.factory import (
    browser_agent,
    developer_agent,
    document_agent,
    mcp_agent,
    multi_modal_agent,
    question_confirm_agent,
    task_summary_agent,
)

__all__ = [
    "browser_agent",
    "developer_agent",
    "document_agent",
    "mcp_agent",
    "multi_modal_agent",
    "question_confirm_agent",
    "task_summary_agent",
]
