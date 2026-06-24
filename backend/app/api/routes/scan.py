# backend/app/api/routes/scan.py
"""
HTTP route for scanning a repository.

Responsibility: expose the scan operation over HTTP. This layer handles
web concerns only — reading the request, calling the service, and turning
results or errors into proper HTTP responses. All real logic lives in the
service and core layers.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.api.schemas import ScanResponse
from app.services.scan_service import scan_repository

# An APIRouter is a group of related endpoints. main.py will plug this
# router into the main app. The prefix means every route here starts
# with /scan, and the tag groups them nicely in the auto-generated docs.
router = APIRouter(prefix="/scan", tags=["scan"])


@router.get("", response_model=ScanResponse)
def scan(
    path: str = Query(..., description="Absolute or relative path to the repository to scan."),
) -> ScanResponse:
    """
    Scan a repository and return its folder/file structure.

    Query parameter:
        path: the repository location on the server's filesystem.

    Returns 200 with the scan result, or 404 if the path is invalid.
    """
    try:
        return scan_repository(path)
    except FileNotFoundError as exc:
        # Path doesn't exist -> 404 Not Found.
        raise HTTPException(status_code=404, detail=str(exc))
    except NotADirectoryError as exc:
        # Path exists but isn't a directory -> 400 Bad Request.
        raise HTTPException(status_code=400, detail=str(exc))