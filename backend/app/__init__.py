# ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ========= Copyright 2025-2026 @ Eigent.ai All Rights Reserved. =========

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI with title
api = FastAPI(title="Apparae Agency Daemon API")


@api.get("/healthz")
async def healthz() -> dict:
    """Health probe used by the OS service supervisor + Tauri daemon_supervisor.

    Per plan 12-A flowchart: returns 200 + {"status":"ok"} once uvicorn is up.
    """
    return {"status": "ok"}


__version__ = "0.0.1"


@api.get("/version")
async def version() -> dict:
    """Reports the daemon version. Used by Smoke 6 (auto-update roundtrip)."""
    return {"version": __version__}

# Add CORS middleware
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
