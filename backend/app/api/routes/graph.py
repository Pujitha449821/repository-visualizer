# backend/app/api/routes/graph.py
"""
HTTP route for the dependency graph.

Exposes the assembled nodes-and-edges graph as JSON. This is the primary
endpoint the React Flow frontend will consume to render the visualization.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.api.schemas import GraphResponse
from app.services.scan_service import build_graph_response

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("", response_model=GraphResponse)
def graph(
    path: str = Query(..., description="Path to the repository to analyze."),
) -> GraphResponse:
    """
    Analyze a repository and return its dependency graph (nodes + edges).

    Returns 200 with the graph, 404 if the path doesn't exist,
    400 if it isn't a directory.
    """
    try:
        return build_graph_response(path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except NotADirectoryError as exc:
        raise HTTPException(status_code=400, detail=str(exc))