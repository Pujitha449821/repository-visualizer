"""
Service layer: orchestrates file summarization with caching.
Sits between the route (HTTP) and ai_client (the AI call).
"""
import hashlib
from pathlib import Path
from app.infra.ai_client import summarize_code

# In-memory cache: { content_hash: summary_text }.
# Lives only while the server runs — fine for now.
_cache: dict[str, str] = {}


def _hash_content(content: str) -> str:
    """Create a short fingerprint of the file content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def get_summary(root: str, file_id: str) -> dict:
    """
    Return an AI summary for a file, using cache when possible.

    Args:
        root: absolute path of the scanned repo.
        file_id: repo-relative path (the node id from the graph).

    Returns:
        { "summary": str, "cached": bool }
    """
    # Rebuild the absolute path to the file on disk.
    full_path = Path(root) / file_id

    if not full_path.is_file():
        raise FileNotFoundError(f"File not found: {full_path}")

    # Read the file's text. errors="ignore" skips odd bytes safely.
    content = full_path.read_text(encoding="utf-8", errors="ignore")

    # Check the cache first.
    key = _hash_content(content)
    if key in _cache:
        return {"summary": _cache[key], "cached": True}

    # Not cached -> call the AI, then store the result.
    summary = summarize_code(full_path.name, content)
    _cache[key] = summary
    return {"summary": summary, "cached": False}