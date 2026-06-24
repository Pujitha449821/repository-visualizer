# backend/app/core/models/graph.py
"""
Internal data models for the dependency graph.

These are the graph builder's own types — distinct from the walker's
FileNode (raw discovery) and the API's schemas (public JSON contract).
A Node is a file plus its metrics; an Edge is a "source imports target"
relationship between two files. The Graph bundles them together.

These map cleanly onto what React Flow expects on the frontend: a list
of nodes and a list of edges connecting them by id.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Node:
    """
    A single file as a graph node.

    `id` is the file's repo-relative path (e.g. "backend/app/main.py"),
    which is unique within a repository and serves as the stable identifier
    that edges reference.
    """
    id: str            # repo-relative path, unique — used by edges
    name: str          # file name only, e.g. "main.py"
    extension: str     # e.g. ".py"
    total_lines: int
    code_lines: int
    blank_lines: int
    is_binary: bool


@dataclass
class Edge:
    """
    A directed dependency between two files.

    Meaning: the file `source` imports / depends on the file `target`.
    Both are Node ids (repo-relative paths).
    """
    source: str        # id of the importing file
    target: str        # id of the imported file


@dataclass
class Graph:
    """The full dependency graph: all nodes and all edges."""
    nodes: list[Node] = field(default_factory=list)
    edges: list[Edge] = field(default_factory=list)