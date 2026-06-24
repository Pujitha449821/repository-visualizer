# backend/app/services/scan_service.py
"""
Service layer for scanning a repository and building its dependency graph.
"""

from __future__ import annotations

from pathlib import Path

from app.core.walker import walk_repository
from app.core.metrics import compute_file_metrics
from app.core.graph_builder import build_graph
from app.api.schemas import (
    ScanResponse, FileSchema, DirSchema,
    GraphResponse, NodeSchema, EdgeSchema,
)


def scan_repository(root_path: str) -> ScanResponse:
    """
    Scan a repository and return its structure with per-file metrics.

    Raises:
        FileNotFoundError / NotADirectoryError: propagated from the walker.
    """
    result = walk_repository(root_path)
    root = Path(result.root)

    file_schemas: list[FileSchema] = []
    for f in result.files:
        metrics = compute_file_metrics(root / f.path)
        file_schemas.append(
            FileSchema(
                path=f.path,
                name=f.name,
                extension=f.extension,
                total_lines=metrics.total_lines,
                code_lines=metrics.code_lines,
                blank_lines=metrics.blank_lines,
                is_binary=metrics.is_binary,
            )
        )

    return ScanResponse(
        root=result.root,
        dirs=[DirSchema(path=d.path, name=d.name) for d in result.dirs],
        files=file_schemas,
    )


def build_graph_response(root_path: str) -> GraphResponse:
    """
    Build the dependency graph and translate it into the API schema.

    Raises:
        FileNotFoundError / NotADirectoryError: propagated from the walker.
    """
    graph = build_graph(root_path)
    root = str(Path(root_path).resolve())

    return GraphResponse(
        root=root,
        nodes=[
            NodeSchema(
                id=n.id,
                name=n.name,
                extension=n.extension,
                total_lines=n.total_lines,
                code_lines=n.code_lines,
                blank_lines=n.blank_lines,
                is_binary=n.is_binary,
            )
            for n in graph.nodes
        ],
        edges=[EdgeSchema(source=e.source, target=e.target) for e in graph.edges],
    )