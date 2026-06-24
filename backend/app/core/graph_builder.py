# backend/app/core/graph_builder.py
"""
Builds a dependency graph from a scanned repository.

This is where everything comes together:
  - walker.py      discovers the files (nodes)
  - metrics.py     measures each file (node data)
  - parsers/       extract the raw imports inside each file
  - this module    resolves those imports to real files and emits EDGES

An edge is only created when an import resolves to a file that actually
exists in the scanned repo. External imports (e.g. "os", third-party libs)
have no corresponding file, so they produce no edge — which is correct.
"""

from __future__ import annotations

from pathlib import Path

from app.core.walker import walk_repository
from app.core.metrics import compute_file_metrics
from app.core.parsers.registry import get_parser_for_extension
from app.core.models.graph import Graph, Node, Edge


def _module_to_relpath(module_name: str) -> str:
    """
    Convert a Python module name into a file path fragment.

    "app.core.walker" -> "app/core/walker.py"
    """
    return module_name.replace(".", "/") + ".py"


def build_graph(root_path: str) -> Graph:
    """
    Scan a repository and build its dependency graph.

    Steps:
      1. Walk the repo to get every file.
      2. For each file, compute metrics and create a Node.
      3. For each parseable file, extract imports and resolve them to other
         files in the repo, creating an Edge per resolved dependency.

    Returns:
        Graph with nodes (files) and edges (resolved import relationships).
    """
    result = walk_repository(root_path)
    root = Path(result.root)

    graph = Graph()

    # --- Pass 1: build all nodes, and an index of file paths for resolution.
    # `all_paths` lets us check, for a given imported module, whether a
    # matching file exists in the repo.
    all_paths: list[str] = [f.path for f in result.files]

    for f in result.files:
        metrics = compute_file_metrics(root / f.path)
        graph.nodes.append(
            Node(
                id=f.path,
                name=f.name,
                extension=f.extension,
                total_lines=metrics.total_lines,
                code_lines=metrics.code_lines,
                blank_lines=metrics.blank_lines,
                is_binary=metrics.is_binary,
            )
        )

    # --- Pass 2: parse imports and create edges.
    for f in result.files:
        parser = get_parser_for_extension(f.extension)
        if parser is None:
            continue  # no parser for this file type -> no outgoing edges

        # Read the file content for the parser. Reuse defensive reading.
        try:
            content = (root / f.path).read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue

        imports = parser.parse_imports(content)

        for imported in imports:
            target_fragment = _module_to_relpath(imported)

            # Find a scanned file whose path ends with the import fragment.
            # e.g. import "app.core.walker" -> fragment "app/core/walker.py"
            #      matches scanned "backend/app/core/walker.py"
            matches = [p for p in all_paths if p.endswith(target_fragment)]

            # Skip self-edges and unresolved (external) imports.
            for target_path in matches:
                if target_path != f.path:
                    graph.edges.append(Edge(source=f.path, target=target_path))

    return graph