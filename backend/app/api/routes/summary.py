"""
HTTP route for AI file summaries.
Delegates all real work to summary_service.
"""
from fastapi import APIRouter, HTTPException, Query
from app.services.summary_service import get_summary

router = APIRouter()


@router.get("/summary")
def summary_endpoint(
    path: str = Query(..., description="Absolute path of the scanned repo"),
    file_id: str = Query(..., description="Repo-relative path of the file (node id)"),
):
    """
    GET /summary?path=<repo>&file_id=<relative/file/path>
    Returns: { "summary": str, "cached": bool }
    """
    try:
        return get_summary(root=path, file_id=file_id)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # Anything else (e.g. an AI/network error) becomes a clean 500.
        raise HTTPException(status_code=500, detail=str(e))