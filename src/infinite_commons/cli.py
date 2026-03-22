"""CLI entrypoint for Infinite Commons proof commands."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .proof_service import safe_run_bootstrap_proof


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="commons", description="Infinite Commons local proof CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    check = subparsers.add_parser("bootstrap-check", help="Run deterministic bootstrap proof")
    check.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Repository root containing pantheon_data/bootstrap/commons/latest_contract.json",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command == "bootstrap-check":
        result = safe_run_bootstrap_proof(args.repo_root)
        output = {
            "success": result.success,
            "summary": result.summary,
            "target": result.target,
            "channel_name": result.channel_name,
            "candidate_id": result.candidate_id,
            "bootstrap_contract_path": result.bootstrap_contract_path,
            "loaded_artifacts": result.loaded_artifacts,
            "missing_required_artifacts": result.missing_required_artifacts,
            "warnings": result.warnings,
        }
        print(json.dumps(output, indent=2))
        return 0 if result.success else 1

    parser.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
