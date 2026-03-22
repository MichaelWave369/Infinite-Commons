"""Local bootstrap contract loader for Infinite Commons."""

from __future__ import annotations

import json
from pathlib import Path

from .errors import (
    BootstrapContractMalformedError,
    BootstrapContractNotFoundError,
    UnreadablePathError,
)
from .models import BootstrapArtifactRef, CommonsBootstrapContext

LATEST_CONTRACT_RELATIVE_PATH = Path("pantheon_data/bootstrap/commons/latest_contract.json")


def _normalize_artifact_path(raw_path: str) -> str:
    candidate = Path(raw_path)
    if candidate.is_absolute():
        raise BootstrapContractMalformedError("Artifact paths must be relative, got absolute path.")

    normalized = candidate.as_posix().strip()
    if not normalized or normalized.startswith("../") or "/../" in normalized:
        raise BootstrapContractMalformedError(f"Unsafe artifact path: {raw_path!r}")

    return normalized


def load_bootstrap_context(repo_root: Path) -> CommonsBootstrapContext:
    """Load and validate Commons bootstrap context from local disk."""
    contract_path = repo_root / LATEST_CONTRACT_RELATIVE_PATH
    if not contract_path.exists():
        raise BootstrapContractNotFoundError(
            f"Missing bootstrap contract: {contract_path.as_posix()}"
        )

    try:
        raw = json.loads(contract_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise BootstrapContractMalformedError(
            f"Malformed bootstrap contract JSON: {contract_path.as_posix()}"
        ) from exc
    except OSError as exc:
        raise UnreadablePathError(
            f"Unreadable bootstrap contract: {contract_path.as_posix()}"
        ) from exc

    try:
        target = str(raw["target"])
        channel_name = raw.get("channel_name")
        candidate_id = raw.get("candidate_id")
        artifact_rows = raw["artifacts"]
    except KeyError as exc:
        raise BootstrapContractMalformedError(
            f"Bootstrap contract missing field: {exc.args[0]}"
        ) from exc

    if not isinstance(artifact_rows, list):
        raise BootstrapContractMalformedError("Bootstrap contract 'artifacts' must be a list.")

    artifacts: list[BootstrapArtifactRef] = []
    for row in artifact_rows:
        if not isinstance(row, dict):
            raise BootstrapContractMalformedError("Each artifact row must be an object.")
        try:
            artifact = BootstrapArtifactRef(
                name=str(row["name"]),
                path=_normalize_artifact_path(str(row["path"])),
                required=bool(row.get("required", True)),
                load_order=int(row["load_order"]),
            )
        except KeyError as exc:
            raise BootstrapContractMalformedError(
                f"Artifact row missing field: {exc.args[0]}"
            ) from exc
        artifacts.append(artifact)

    artifacts.sort(key=lambda item: item.load_order)
    return CommonsBootstrapContext(
        contract_path=contract_path,
        target=target,
        channel_name=str(channel_name) if channel_name is not None else None,
        candidate_id=str(candidate_id) if candidate_id is not None else None,
        artifacts=tuple(artifacts),
    )
