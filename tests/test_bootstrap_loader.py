from __future__ import annotations

import json
from pathlib import Path

import pytest

from infinite_commons.bootstrap_loader import (
    LATEST_CONTRACT_RELATIVE_PATH,
    load_bootstrap_context,
)
from infinite_commons.errors import BootstrapContractMalformedError, BootstrapContractNotFoundError

FIXTURE_ROOT = Path(__file__).parent / "fixtures"


def _write_latest_contract(repo_root: Path, fixture_contract: Path) -> None:
    target = repo_root / LATEST_CONTRACT_RELATIVE_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(fixture_contract.read_text(encoding="utf-8"), encoding="utf-8")


def test_load_bootstrap_context_success_and_ordered(tmp_path: Path) -> None:
    _write_latest_contract(tmp_path, FIXTURE_ROOT / "success/bootstrap/latest_contract.json")

    context = load_bootstrap_context(tmp_path)

    assert context.target == "commons"
    assert context.channel_name == "stable"
    assert context.candidate_id == "cand-001"
    assert [a.load_order for a in context.artifacts] == [10, 20, 30]
    assert [a.name for a in context.artifacts] == ["manifest", "index", "optional_notes"]


def test_load_bootstrap_context_missing_contract(tmp_path: Path) -> None:
    with pytest.raises(BootstrapContractNotFoundError):
        load_bootstrap_context(tmp_path)


def test_load_bootstrap_context_rejects_unsafe_path(tmp_path: Path) -> None:
    target = tmp_path / LATEST_CONTRACT_RELATIVE_PATH
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps(
            {
                "target": "commons",
                "artifacts": [
                    {
                        "name": "bad",
                        "path": "../outside.json",
                        "required": True,
                        "load_order": 1,
                    }
                ],
            }
        ),
        encoding="utf-8",
    )

    with pytest.raises(BootstrapContractMalformedError):
        load_bootstrap_context(tmp_path)
