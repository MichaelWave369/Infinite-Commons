"""Deterministic proof service for Commons bootstrap contracts."""

from __future__ import annotations

from pathlib import Path

from .artifact_loader import load_json_artifact
from .bootstrap_loader import LATEST_CONTRACT_RELATIVE_PATH, load_bootstrap_context
from .errors import ArtifactMalformedError, ArtifactNotFoundError, CommonsError
from .models import CommonsBootResult


def run_bootstrap_proof(repo_root: Path) -> CommonsBootResult:
    """Run a deterministic bootstrap proof using local Commons artifacts."""
    context = load_bootstrap_context(repo_root)
    loaded_artifacts: list[str] = []
    missing_required: list[str] = []
    warnings: list[str] = []

    for artifact in context.artifacts:
        try:
            load_json_artifact(repo_root, artifact.path)
            loaded_artifacts.append(artifact.path)
        except ArtifactNotFoundError:
            if artifact.required:
                missing_required.append(artifact.path)
                break
            warnings.append(f"Optional artifact missing: {artifact.path}")
        except ArtifactMalformedError as exc:
            if artifact.required:
                summary = f"Bootstrap failed: required artifact malformed ({artifact.path})."
                return CommonsBootResult(
                    bootstrap_contract_path=context.contract_path.as_posix(),
                    target=context.target,
                    channel_name=context.channel_name,
                    candidate_id=context.candidate_id,
                    loaded_artifacts=loaded_artifacts,
                    missing_required_artifacts=missing_required,
                    warnings=warnings,
                    success=False,
                    summary=summary,
                )
            warnings.append(str(exc))

    if missing_required:
        summary = (
            "Bootstrap failed: missing required artifacts: " + ", ".join(missing_required)
        )
        return CommonsBootResult(
            bootstrap_contract_path=context.contract_path.as_posix(),
            target=context.target,
            channel_name=context.channel_name,
            candidate_id=context.candidate_id,
            loaded_artifacts=loaded_artifacts,
            missing_required_artifacts=missing_required,
            warnings=warnings,
            success=False,
            summary=summary,
        )

    summary = f"Bootstrap proof succeeded with {len(loaded_artifacts)} loaded artifact(s)."
    return CommonsBootResult(
        bootstrap_contract_path=context.contract_path.as_posix(),
        target=context.target,
        channel_name=context.channel_name,
        candidate_id=context.candidate_id,
        loaded_artifacts=loaded_artifacts,
        missing_required_artifacts=missing_required,
        warnings=warnings,
        success=True,
        summary=summary,
    )


def safe_run_bootstrap_proof(repo_root: Path) -> CommonsBootResult:
    """Run proof and convert domain exceptions into deterministic failure results."""
    try:
        return run_bootstrap_proof(repo_root)
    except CommonsError as exc:
        return CommonsBootResult(
            bootstrap_contract_path=(repo_root / LATEST_CONTRACT_RELATIVE_PATH).as_posix(),
            target="commons",
            channel_name=None,
            candidate_id=None,
            loaded_artifacts=[],
            missing_required_artifacts=[],
            warnings=[],
            success=False,
            summary=str(exc),
        )
