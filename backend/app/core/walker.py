# backend/app/core/walker.py
"""
Directory traversal for repository analysis.

Responsibility: discover the folder/file structure of a local repository.
This module ONLY walks the tree and reports what exists. It does not read
file contents, calculate metrics, or parse dependencies — those concerns
live in separate modules (metrics.py, parsers/).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


# Directories we never want to descend into. They add noise and bloat
# without telling us anything about the project's actual source code.
DEFAULT_IGNORED_DIRS: set[str] = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "env",
    ".mypy_cache",
    ".pytest_cache",
    ".idea",
    ".vscode",
    "dist",
    "build",
    ".next",
    "coverage",
}


@dataclass
class FileNode:
    """A single file discovered during the walk."""
    path: str          # relative path from the repo root, e.g. "app/main.py"
    name: str          # just the file name, e.g. "main.py"
    extension: str     # file extension including the dot, e.g. ".py"


@dataclass
class DirNode:
    """A directory discovered during the walk."""
    path: str          # relative path from the repo root, e.g. "app/core"
    name: str          # just the directory name, e.g. "core"


@dataclass
class WalkResult:
    """The full result of walking a repository."""
    root: str
    files: list[FileNode] = field(default_factory=list)
    dirs: list[DirNode] = field(default_factory=list)


def walk_repository(
    root_path: str | Path,
    ignored_dirs: set[str] | None = None,
) -> WalkResult:
    """
    Recursively walk a repository and return its structure.

    Args:
        root_path: Absolute or relative path to the repository root.
        ignored_dirs: Directory names to skip. Falls back to a sensible
                      default set if not provided.

    Returns:
        WalkResult containing every file and directory (excluding ignored ones),
        with paths relative to the repository root.

    Raises:
        FileNotFoundError: If root_path does not exist.
        NotADirectoryError: If root_path is not a directory.
    """
    root = Path(root_path).resolve()

    if not root.exists():
        raise FileNotFoundError(f"Path does not exist: {root}")
    if not root.is_dir():
        raise NotADirectoryError(f"Path is not a directory: {root}")

    ignored = ignored_dirs if ignored_dirs is not None else DEFAULT_IGNORED_DIRS

    result = WalkResult(root=str(root))

    def _walk(current: Path) -> None:
        # Sort entries so output is deterministic (important for testing).
        try:
            entries = sorted(current.iterdir(), key=lambda p: p.name)
        except PermissionError:
            # Skip directories we can't read rather than crashing.
            return

        for entry in entries:
            if entry.is_dir():
                if entry.name in ignored:
                    continue
                rel = entry.relative_to(root).as_posix()
                result.dirs.append(DirNode(path=rel, name=entry.name))
                _walk(entry)
            elif entry.is_file():
                rel = entry.relative_to(root).as_posix()
                result.files.append(
                    FileNode(
                        path=rel,
                        name=entry.name,
                        extension=entry.suffix,
                    )
                )

    _walk(root)
    return result