# backend/app/core/metrics.py
"""
File-level metrics for repository analysis.

Responsibility: given a file on disk, compute simple metrics about it —
primarily Lines of Code (LoC). This module reads file CONTENTS, which is
deliberately separate from walker.py (which only discovers files).

Reads are defensive: real repositories contain binary files, unusual
encodings, and empty files. We never want metric-counting to crash a scan.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


# Extensions we treat as binary / non-source and skip counting entirely.
# Counting "lines" in a PNG is meaningless and risks reading garbage.
BINARY_EXTENSIONS: set[str] = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg",
    ".pdf", ".zip", ".tar", ".gz", ".exe", ".dll", ".so",
    ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".mp3", ".lock",
}


@dataclass
class FileMetrics:
    """Metrics computed for a single file."""
    total_lines: int
    code_lines: int      # non-blank lines
    blank_lines: int
    is_binary: bool      # True if we skipped counting (binary/unreadable)


def compute_file_metrics(file_path: str | Path) -> FileMetrics:
    """
    Compute line metrics for a single file.

    Binary files (by extension) and unreadable files return a zeroed
    FileMetrics with is_binary=True, rather than raising. This keeps a
    single bad file from breaking an entire repository scan.

    Args:
        file_path: Absolute path to the file to measure.

    Returns:
        FileMetrics for the file.
    """
    path = Path(file_path)

    # Skip known-binary extensions outright.
    if path.suffix.lower() in BINARY_EXTENSIONS:
        return FileMetrics(total_lines=0, code_lines=0, blank_lines=0, is_binary=True)

    try:
        # errors="ignore" so a stray non-UTF-8 byte doesn't crash us.
        with path.open("r", encoding="utf-8", errors="ignore") as fh:
            lines = fh.readlines()
    except (OSError, UnicodeError):
        # Unreadable for any reason -> treat as binary/zero, don't crash.
        return FileMetrics(total_lines=0, code_lines=0, blank_lines=0, is_binary=True)

    total = len(lines)
    blank = sum(1 for line in lines if line.strip() == "")
    code = total - blank

    return FileMetrics(
        total_lines=total,
        code_lines=code,
        blank_lines=blank,
        is_binary=False,
    )