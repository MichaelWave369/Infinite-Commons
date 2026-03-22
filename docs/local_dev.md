# Local Development

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run checks

```bash
ruff check .
pytest
```

## Run deterministic Commons proof

From repository root:

```bash
commons bootstrap-check
```

Optional custom root:

```bash
commons bootstrap-check --repo-root /absolute/path/to/Infinite-Commons
```

## Interpreting proof output

The command prints:
- target/channel/candidate context
- loaded artifact list (in load order)
- missing required list
- warnings list
- success status and summary

A successful proof indicates Infinite Commons can boot from the current Pantheon bootstrap artifact set present on local disk.
