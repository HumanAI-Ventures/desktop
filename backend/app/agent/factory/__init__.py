# ========= Copyright 2025-2026 @ HumanAI Ventures Inc. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Original work © 2025-2026 Eigent.ai (Apache-2.0).
# Per plan 12-A Task 6 + drift addendum: social_media factory DELETED
# (CAMEL-coupled). remote_sub_agent factory KEPT (wraps a Pattern-2-retained
# toolkit). Other seven factories STUBBED to NotImplementedError.
# ===============================================================

from app.agent.factory.browser import browser_agent
from app.agent.factory.developer import developer_agent
from app.agent.factory.document import document_agent
from app.agent.factory.mcp import mcp_agent
from app.agent.factory.multi_modal import multi_modal_agent
from app.agent.factory.question_confirm import question_confirm_agent
from app.agent.factory.task_summary import task_summary_agent

__all__ = [
    "browser_agent",
    "developer_agent",
    "document_agent",
    "mcp_agent",
    "multi_modal_agent",
    "question_confirm_agent",
    "task_summary_agent",
]
