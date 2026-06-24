# backend/app/core/parsers/base.py
"""
Base interface for all language parsers.

Every parser (Python, JavaScript, C/C++, ...) detects the dependencies
declared inside a source file. They differ in HOW they read imports, but
they all answer the same question: "which other modules does this file
reference?" This module defines that shared contract.

Using a common base class means the rest of the system (the graph builder)
can work with ANY parser without knowing its language-specific details.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseParser(ABC):
    """
    Abstract base class for a language-specific dependency parser.

    Subclasses must implement `parse_imports`, which takes the text content
    of a single source file and returns the raw module references found in it
    (e.g. "os", "app.core.walker"). Resolving those references to actual files
    in the repo happens later, in the graph builder — the parser's only job is
    extraction.
    """

    @abstractmethod
    def parse_imports(self, content: str) -> list[str]:
        """
        Extract the module/dependency names imported by a source file.

        Args:
            content: The full text of the source file.

        Returns:
            A list of raw imported module names, as written in the file.
            Order need not be meaningful; duplicates may be removed by callers.
        """
        raise NotImplementedError