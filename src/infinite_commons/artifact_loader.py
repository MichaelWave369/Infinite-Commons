"""Local artifact loading utilities for Infinite Commons."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .errors import ArtifactMalformedError, ArtifactNotFoundError, UnreadablePathError


def load_json_artifact(repo_root: Path, artifact_path: str) -> dict[str, Any]:
    """Load and parse a JSON artifact from repo-root-relative path."""
    path = repo_root / artifact_path
    if not path.exists():
        raise ArtifactNotFoundError(f"Missing artifact: {artifact_path}")

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ArtifactMalformedError(f"Malformed artifact JSON: {artifact_path}") from exc
    except OSError as exc:
        raise UnreadablePathError(f"Unreadable artifact path: {artifact_path}") from exc

    if not isinstance(raw, dict):
        raise ArtifactMalformedError(f"Artifact must contain a JSON object: {artifact_path}")

    return raw
