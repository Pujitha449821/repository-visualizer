"""
Service layer: orchestrates file summarization with caching.
Sits between the route (HTTP) and ai_client (the AI call).
"""
import hashlib
from pathlib import Path
from app.infra.ai_client import summarize_code

# In-memory cache: { content_hash: summary_text }.
_cache: dict[str, str] = {}

# Size guards (in characters):
# Files larger than HARD_LIMIT are skipped entirely (too big to summarize).
# Files between SOFT_CAP and HARD_LIMIT are trimmed to SOFT_CAP before sending.
SOFT_CAP = 12_000      # ~ a few hundred lines of code
HARD_LIMIT = 100_000   # anything bigger is skipped


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
    full_path = Path(root) / file_id

    if not full_path.is_file():
        raise FileNotFoundError(f"File not found: {full_path}")

    content = full_path.read_text(encoding="utf-8", errors="ignore")

    # Guard 1: empty / unreadable files.
    if not content.strip():
        return {
            "summary": "This file is empty or has no readable text content.",
            "cached": False,
        }

    # Guard 2: truly huge files — skip the AI call entirely.
    if len(content) > HARD_LIMIT:
        return {
            "summary": (
                f"This file is too large to summarize "
                f"({len(content):,} characters). Large generated files "
                f"like notebooks or lock files are skipped to save resources."
            ),
            "cached": False,
        }

    # Guard 3: merely large files — trim to the soft cap before sending.
    truncated = len(content) > SOFT_CAP
    snippet = content[:SOFT_CAP] if truncated else content

    # Cache key is based on the snippet actually sent (so trimming is consistent).
    key = _hash_content(snippet)
    if key in _cache:
        return {"summary": _cache[key], "cached": True}

    summary = summarize_code(full_path.name, snippet)

    # If we trimmed, note that in the returned summary so it's honest.
    if truncated:
        summary += "\n\n(Note: summary based on the first part of a large file.)"

    _cache[key] = summary
    return {"summary": summary, "cached": False}