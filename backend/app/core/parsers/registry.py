# backend/app/core/parsers/registry.py
"""
Parser registry: maps file extensions to the parser that handles them.

This is the single source of truth for "which language parser handles
which file type." The graph builder asks this registry for a parser by
file extension instead of hardcoding language logic. Adding support for
a new language means registering it here — and nowhere else.
"""

from __future__ import annotations

from app.core.parsers.base import BaseParser
from app.core.parsers.python_parser import PythonParser


# Map of file extension -> a single shared parser instance.
# Parsers are stateless, so one instance can be reused for every file.
_PARSERS_BY_EXTENSION: dict[str, BaseParser] = {
    ".py": PythonParser(),
}


def get_parser_for_extension(extension: str) -> BaseParser | None:
    """
    Return the parser registered for a file extension, or None.

    Args:
        extension: File extension including the dot, e.g. ".py".

    Returns:
        The matching BaseParser instance, or None if the extension has no
        registered parser (meaning we don't analyze dependencies for it).
    """
    return _PARSERS_BY_EXTENSION.get(extension.lower())


def supported_extensions() -> list[str]:
    """Return the list of extensions that currently have a parser."""
    return list(_PARSERS_BY_EXTENSION.keys())