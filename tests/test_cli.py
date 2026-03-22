from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

from infinite_commons.bootstrap_loader import LATEST_CONTRACT_RELATIVE_PATH

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


def _cli_env() -> dict[str, str]:
    env = dict(os.environ)
    env["PYTHONPATH"] = str(Path(__file__).resolve().parents[1] / "src")
    return env


def test_cli_bootstrap_check_success(tmp_path: Path) -> None:
    repo_root = _prepare_repo(tmp_path, "success")

    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "infinite_commons.cli",
            "bootstrap-check",
            "--repo-root",
            str(repo_root),
        ],
        check=False,
        capture_output=True,
        text=True,
        env=_cli_env(),
    )

    assert proc.returncode == 0
    payload = json.loads(proc.stdout)
    assert payload["success"] is True


def test_cli_bootstrap_check_failure(tmp_path: Path) -> None:
    repo_root = _prepare_repo(tmp_path, "missing_required")

    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "infinite_commons.cli",
            "bootstrap-check",
            "--repo-root",
            str(repo_root),
        ],
        check=False,
        capture_output=True,
        text=True,
        env=_cli_env(),
    )

    assert proc.returncode == 1
    payload = json.loads(proc.stdout)
    assert payload["success"] is False
