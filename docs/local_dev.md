# Local Development

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

On Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

## Run checks

```bash
ruff check .
pytest
```

## Run deterministic Commons proof

From a project root containing:

`commons_data/bootstrap/latest_contract.json`

run:

```bash
commons bootstrap-check
```

Optional custom root:

```bash
commons bootstrap-check --repo-root /absolute/path/to/project
```

## Interpreting proof output

The command reports:

- target/channel/candidate context
- contract path selected
- loaded artifact list in load order
- missing required artifacts
- warnings
- success status and summary

A successful proof means the local contract and all required referenced JSON artifacts were readable and structurally loadable. It does not imply that artifact claims are externally verified or trustworthy beyond that contract boundary.

The legacy Pantheon path remains accepted for compatibility, but new development should use the canonical `commons_data/` layout.
