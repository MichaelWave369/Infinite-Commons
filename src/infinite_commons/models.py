"""Typed models for Infinite Commons bootstrap proof."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class BootstrapArtifactRef:
    """A single artifact reference from the bootstrap contract."""

    name: str
    path: str
    required: bool
    load_order: int


@dataclass(frozen=True, slots=True)
class CommonsBootstrapContext:
    """Structured bootstrap context from latest contract."""

    contract_path: Path
    target: str
    channel_name: str | None
    candidate_id: str | None
    artifacts: tuple[BootstrapArtifactRef, ...]


@dataclass(frozen=True, slots=True)
class CommonsBootResult:
    """Deterministic proof result for commons bootstrap readiness."""

    bootstrap_contract_path: str
    target: str
    channel_name: str | None
    candidate_id: str | None
    loaded_artifacts: list[str]
    missing_required_artifacts: list[str]
    warnings: list[str]
    success: bool
    summary: str
