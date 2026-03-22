# Infinite Commons

**Infinite Commons is the public-safe downstream consumer for Phi-Pantheon, built to load deterministic bootstrap contracts, channel-selected candidates, and Commons-ready artifact bundles.**

This repository is private and proprietary, and currently focused on:
- public-safe consumer integration behavior
- local deterministic bootstrap ingestion
- no network dependence
- private build-phase integration with Phi-Pantheon

## Scope (current pass)

Infinite Commons currently proves one deterministic local handoff contract:
1. Read Pantheon Commons bootstrap contract data from local disk.
2. Resolve target/channel/candidate context.
3. Load required artifacts in ordered sequence.
4. Fail clearly on missing or malformed required artifacts.
5. Expose a clean local proof command.

No server, UI, OAuth, remote API sync, or network bootstrap is used in this phase.

## Expected bootstrap contract path

By default, the CLI checks:

`pantheon_data/bootstrap/commons/latest_contract.json`

## CLI

Run the deterministic proof check:

```bash
commons bootstrap-check
```

You can also provide a custom repo root:

```bash
commons bootstrap-check --repo-root /path/to/local/repo
```

## Development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
ruff check .
pytest
```

See docs:
- `docs/bootstrap_contract.md`
- `docs/local_dev.md`

## License

Private proprietary. See `LICENSE`.
