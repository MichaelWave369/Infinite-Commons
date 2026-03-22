from __future__ import annotations

import shutil
from pathlib import Path

from infinite_commons.bootstrap_loader import LATEST_CONTRACT_RELATIVE_PATH
from infinite_commons.proof_service import run_bootstrap_proof, safe_run_bootstrap_proof

FIXTURE_ROOT = Path(__file__).parent / "fixtures"


def _prepare_repo(tmp_path: Path, fixture_case: str) -> Path:
    case_root = FIXTURE_ROOT / fixture_case
    contract_target = tmp_path / LATEST_CONTRACT_RELATIVE_PATH
    contract_target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(case_root / "bootstrap/latest_contract.json", contract_target)

    consumers_src = case_root / "consumers"
    consumers_dst = tmp_path / "tests/fixtures" / fixture_case / "consumers"
    consumers_dst.mkdir(parents=True, exist_ok=True)
    for path in consumers_src.glob("*.json"):
        shutil.copy2(path, consumers_dst / path.name)

    return tmp_path


def test_run_bootstrap_proof_success(tmp_path: Path) -> None:
    repo_root = _prepare_repo(tmp_path, "success")

    result = run_bootstrap_proof(repo_root)

    assert result.success is True
    assert result.loaded_artifacts == [
        "tests/fixtures/success/consumers/manifest.json",
        "tests/fixtures/success/consumers/index.json",
        "tests/fixtures/success/consumers/optional_notes.json",
    ]
    assert result.missing_required_artifacts == []


def test_run_bootstrap_proof_missing_required_artifact(tmp_path: Path) -> None:
    repo_root = _prepare_repo(tmp_path, "missing_required")

    result = run_bootstrap_proof(repo_root)

    assert result.success is False
    assert result.missing_required_artifacts == [
        "tests/fixtures/missing_required/consumers/index.json"
    ]


def test_run_bootstrap_proof_malformed_required_artifact(tmp_path: Path) -> None:
    repo_root = _prepare_repo(tmp_path, "malformed")

    result = run_bootstrap_proof(repo_root)

    assert result.success is False
    assert "malformed" in result.summary.lower()


def test_safe_run_bootstrap_proof_missing_contract_returns_failure_result(tmp_path: Path) -> None:
    result = safe_run_bootstrap_proof(tmp_path)

    assert result.success is False
    assert "Missing bootstrap contract" in result.summary
