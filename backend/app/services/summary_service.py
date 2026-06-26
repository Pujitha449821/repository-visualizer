"""
Service layer: orchestrates file summarization with caching.
Reads each file type intelligently before sending to the AI.
"""
import hashlib
import json
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
    text = str(err).lower()
    return "429" in text or "resource_exhausted" in text or "quota" in text


def _is_temporary_error(err: Exception) -> bool:
    text = str(err).lower()
    return "503" in text or "unavailable" in text or "high demand" in text


def _extract_notebook(full_path: Path) -> str:
    """
    For .ipynb files: pull out ONLY the code cells (skip outputs/images),
    so the AI reads the actual logic, not the bloated output data.
    """
    raw = full_path.read_text(encoding="utf-8", errors="ignore")
    nb = json.loads(raw)  # a notebook is JSON

    code_pieces = []
    for cell in nb.get("cells", []):
        if cell.get("cell_type") == "code":
            # 'source' is a list of strings (lines) or a single string.
            src = cell.get("source", "")
            if isinstance(src, list):
                src = "".join(src)
            if src.strip():
                code_pieces.append(src)

    if not code_pieces:
        return ""  # notebook with no code cells

    # Join all code cells with separators so the AI sees them as one program.
    return "\n\n# --- next cell ---\n\n".join(code_pieces)


def _extract_csv(full_path: Path) -> str:
    """
    For .csv files: read only the header row + a few sample rows,
    so the AI describes what the dataset contains from its structure.
    """
    lines = []
    with full_path.open("r", encoding="utf-8", errors="ignore") as f:
        for i, line in enumerate(f):
            lines.append(line.rstrip("\n"))
            if i >= 5:  # header + 5 sample rows is plenty
                break

    if not lines:
        return ""

    header = lines[0]
    samples = lines[1:]
    return (
        f"This is a CSV dataset.\n"
        f"Column headers: {header}\n\n"
        f"Sample rows:\n" + "\n".join(samples)
    )

def _extract_json(full_path: Path) -> str:
    """
    For .json files: show the top-level structure (keys and value types)
    rather than dumping the whole file, so the AI can describe its purpose.
    """
    raw = full_path.read_text(encoding="utf-8", errors="ignore")
    data = json.loads(raw)

    if isinstance(data, dict):
        # Describe each top-level key and the type of its value.
        lines = ["This is a JSON object with these top-level keys:"]
        for key, value in data.items():
            vtype = type(value).__name__  # e.g. 'str', 'list', 'dict', 'int'
            lines.append(f"- {key} ({vtype})")
        return "\n".join(lines)

    if isinstance(data, list):
        return (
            f"This is a JSON array with {len(data)} items. "
            f"First item type: {type(data[0]).__name__ if data else 'empty'}."
        )

    # A bare value (rare for a .json file)
    return f"This JSON file contains a single {type(data).__name__} value."


def _extract_content(full_path: Path) -> str:
    """
    Choose how to read a file based on its type, returning the text
    we'll send to the AI.
    """
    suffix = full_path.suffix.lower()

    if suffix == ".ipynb":
        return _extract_notebook(full_path)
    if suffix == ".csv":
        return _extract_csv(full_path)
    if suffix == ".json":
        return _extract_json(full_path)

    # Default: read as plain text.
    return full_path.read_text(encoding="utf-8", errors="ignore")


def get_summary(root: str, file_id: str) -> dict:
    """
    Return an AI summary for a file, using cache when possible.
    Returns { "summary": str, "cached": bool }.
    """
    full_path = Path(root) / file_id

    if not full_path.is_file():
        raise FileNotFoundError(f"File not found: {full_path}")

    # Read the file using the right strategy for its type.
    try:
        content = _extract_content(full_path)
    except Exception:
        # If parsing fails (e.g. malformed notebook), fall back to plain text.
        content = full_path.read_text(encoding="utf-8", errors="ignore")

    if not content.strip():
        return {
            "summary": "This file is empty or has no readable text content.",
            "cached": False,
        }

    # Even after smart extraction, a file could still be enormous.
    if len(content) > HARD_LIMIT:
        return {
            "summary": (
                f"This file is too large to summarize even after extracting "
                f"its key parts ({len(content):,} characters)."
            ),
            "cached": False,
        }

    truncated = len(content) > SOFT_CAP
    snippet = content[:SOFT_CAP] if truncated else content

    key = _hash_content(snippet)
    if key in _cache:
        return {"summary": _cache[key], "cached": True}

    summary = None
    MAX_ATTEMPTS = 3
    for attempt in range(MAX_ATTEMPTS):
        try:
            summary = summarize_code(full_path.name, snippet)
            break
        except Exception as err:
            retryable = _is_rate_limit_error(err) or _is_temporary_error(err)
            is_last = attempt == MAX_ATTEMPTS - 1
            if retryable and not is_last:
                time.sleep(3)
                continue
            if _is_rate_limit_error(err):
                return {
                    "summary": (
                        "The AI is receiving too many requests right now "
                        "(free-tier rate limit). Please wait a few seconds "
                        "and click the file again."
                    ),
                    "cached": False,
                }
            if _is_temporary_error(err):
                return {
                    "summary": (
                        "The AI model is temporarily busy (high demand on "
                        "Google's side). This usually clears in a moment — "
                        "please click the file again shortly."
                    ),
                    "cached": False,
                }
            raise

    if truncated:
        summary += "\n\n(Note: summary based on the first part of a large file.)"

    _cache[key] = summary
    return {"summary": summary, "cached": False}