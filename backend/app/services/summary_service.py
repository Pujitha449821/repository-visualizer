"""
Service layer: orchestrates file summarization with caching.
Sits between the route (HTTP) and ai_client (the AI call).
"""
import hashlib
import time
from pathlib import Path
from app.infra.ai_client import summarize_code

# In-memory cache: { content_hash: summary_text }.
_cache: dict[str, str] = {}

# Size guards (in characters).
SOFT_CAP = 12_000
HARD_LIMIT = 100_000


def _hash_content(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def _is_rate_limit_error(err: Exception) -> bool:
    """Detect a Gemini 429 / quota error from its text."""
    text = str(err).lower()
    return "429" in text or "resource_exhausted" in text or "quota" in text


def get_summary(root: str, file_id: str) -> dict:
    """
    Return an AI summary for a file, using cache when possible.
    Returns { "summary": str, "cached": bool }.
    """
    full_path = Path(root) / file_id

    if not full_path.is_file():
        raise FileNotFoundError(f"File not found: {full_path}")

    content = full_path.read_text(encoding="utf-8", errors="ignore")

    if not content.strip():
        return {
            "summary": "This file is empty or has no readable text content.",
            "cached": False,
        }

    if len(content) > HARD_LIMIT:
        return {
            "summary": (
                f"This file is too large to summarize "
                f"({len(content):,} characters). Large generated files "
                f"like notebooks or lock files are skipped to save resources."
            ),
            "cached": False,
        }

    truncated = len(content) > SOFT_CAP
    snippet = content[:SOFT_CAP] if truncated else content

    key = _hash_content(snippet)
    if key in _cache:
        return {"summary": _cache[key], "cached": True}

    # Call the AI, retrying once on a rate limit (per-minute limits clear fast).
    summary = None
    for attempt in range(2):
        try:
            summary = summarize_code(full_path.name, snippet)
            break
        except Exception as err:
            if _is_rate_limit_error(err) and attempt == 0:
                time.sleep(3)  # brief pause, then one retry
                continue
            if _is_rate_limit_error(err):
                # Still rate-limited after retry -> friendly message, not a crash.
                return {
                    "summary": (
                        "The AI is receiving too many requests right now "
                        "(free-tier rate limit). Please wait a few seconds "
                        "and click the file again."
                    ),
                    "cached": False,
                }
            # Any other error -> re-raise so we still see real bugs.
            raise

    if truncated:
        summary += "\n\n(Note: summary based on the first part of a large file.)"

    _cache[key] = summary
    return {"summary": summary, "cached": False}