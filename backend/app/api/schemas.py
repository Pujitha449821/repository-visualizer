# backend/app/api/schemas.py
"""
Pydantic models defining the shape of API responses.
"""

from __future__ import annotations

from pydantic import BaseModel


class FileSchema(BaseModel):
    """A single file in the scan response."""
    path: str
    name: str
    extension: str
    total_lines: int
    code_lines: int
    blank_lines: int
    is_binary: bool


class DirSchema(BaseModel):
    """A single directory in the scan response."""
    path: str
    name: str


class ScanResponse(BaseModel):
    """The full response returned by the /scan endpoint."""
    root: str
    dirs: list[DirSchema]
    files: list[FileSchema]

class NodeSchema(BaseModel):
    """A file as a graph node, with its metrics."""
    id: str
    name: str
    extension: str
    total_lines: int
    code_lines: int
    blank_lines: int
    is_binary: bool


class EdgeSchema(BaseModel):
    """A directed dependency: source imports target."""
    source: str
    target: str


class GraphResponse(BaseModel):
    """The full dependency graph returned by the /graph endpoint."""
    root: str
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]