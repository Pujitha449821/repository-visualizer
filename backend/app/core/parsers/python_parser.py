# backend/app/core/parsers/python_parser.py
"""
Python dependency parser.

Extracts the modules imported by a Python source file using the built-in
`ast` module. We parse the real syntax tree rather than scanning text, so
"import" appearing in a comment or string is never mistaken for a real
import. The parser only EXTRACTS names; resolving them to files in the
repo is the graph builder's job.
"""

from __future__ import annotations

import ast

from app.core.parsers.base import BaseParser


class PythonParser(BaseParser):
    """Parses `import` and `from ... import` statements from Python code."""

    def parse_imports(self, content: str) -> list[str]:
        """
        Extract imported module names from Python source text.

        Handles:
            import os                  -> "os"
            import os.path             -> "os.path"
            from app.core import x     -> "app.core"
            from . import y            -> skipped (relative, no module name)

        If the file has a syntax error (can't be parsed), we return an empty
        list rather than crashing — a malformed file shouldn't break a scan.
        """
        try:
            tree = ast.parse(content)
        except SyntaxError:
            return []

        modules: list[str] = []

        for node in ast.walk(tree):
            # Case 1:  import os, import os.path, import a, b
            if isinstance(node, ast.Import):
                for alias in node.names:
                    modules.append(alias.name)

            # Case 2:  from X import y
            elif isinstance(node, ast.ImportFrom):
                # node.module is the "X" in "from X import y".
                # For relative imports like "from . import y", node.module
                # may be None and node.level > 0 — we skip those here since
                # there's no absolute module name to record. (Resolving
                # relative imports can be added later if needed.)
                if node.module is not None:
                    modules.append(node.module)

        # De-duplicate while preserving order.
        seen: set[str] = set()
        unique: list[str] = []
        for m in modules:
            if m not in seen:
                seen.add(m)
                unique.append(m)
        return unique