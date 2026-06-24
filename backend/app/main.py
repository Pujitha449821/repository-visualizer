# backend/app/main.py
"""
FastAPI application entry point.

Responsibility: create the app, configure cross-cutting concerns (like CORS
so the React frontend can call us), and register all route routers.

Keep this file thin — it wires things together but contains no business
logic itself.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import scan

from app.api.routes import scan, graph

app = FastAPI(
    title="Repository Visualizer API",
    description="Scans local repositories and exposes their structure as graph data.",
    version="0.1.0",
)

# CORS: the React frontend runs on a different origin (localhost:5173) than
# this API (127.0.0.1:8000). Browsers block cross-origin requests by default,
# so we explicitly allow the frontend's origin. Without this, your React fetch
# calls will fail later with a CORS error.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """A simple health-check endpoint to confirm the API is alive."""
    return {"status": "ok", "service": "Repository Visualizer API"}


# Register routers. Each feature (scan, graph, file, summary) lives in its
# own router file and gets plugged in here.
app.include_router(scan.router)
app.include_router(graph.router)