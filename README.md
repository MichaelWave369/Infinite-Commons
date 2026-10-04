# Infinite Commons

**Infinite Commons is a small, deterministic layer for publishing and consuming shared machine-readable artifact bundles.**

It is designed for local-first workflows where a producer writes a bootstrap contract plus referenced artifacts, and a consumer verifies and loads those artifacts in a predictable order.

Infinite Commons is intentionally:

- producer-agnostic
- local-first
- deterministic
- explicit about required vs optional artifacts
- safe about repository-relative paths
- usable without an account, server, cloud service, or network bootstrap

The project does **not** require Infinite Porch, PhiOS, Phi-Pantheon, or any other specific producer. Those systems may integrate with Infinite Commons through the same contract boundary as any other application.

## Current scope

Infinite Commons 0.1.x proves one compact handoff contract:

1. Read a Commons bootstrap contract from local disk.
2. Resolve target, channel, and candidate context.
3. Load referenced artifacts in deterministic order.
4. Fail clearly when required artifacts are missing or malformed.
5. Expose the result through a simple CLI.

The current implementation is deliberately small. There is no server, UI, OAuth flow, remote API, or background synchronization layer.

## Canonical bootstrap contract

By default the CLI reads:

`commons_data/bootstrap/latest_contract.json`

For compatibility with the project's earliest internal prototype, the loader can also read the legacy path:

`pantheon_data/bootstrap/commons/latest_contract.json`

The canonical Commons path always wins when both exist. See [Pantheon compatibility](docs/PANTHEON_COMPATIBILITY.md).

## CLI

Run the deterministic proof:

```bash
commons bootstrap-check
```

Or point it at another repository root:

```bash
commons bootstrap-check --repo-root /path/to/project
```

The command reports:

- success/failure
- target
- channel
- candidate
- contract path used
- loaded artifacts
- missing required artifacts
- warnings

## Development

Requires Python 3.12+.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
ruff check .
pytest
```

On Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
ruff check .
pytest
```

## Contract documentation

- [Bootstrap contract](docs/bootstrap_contract.md)
- [Local development](docs/local_dev.md)
- [Legacy Pantheon compatibility](docs/PANTHEON_COMPATIBILITY.md)

## Relationship to Infinite Porch

Infinite Commons and Infinite Porch solve different problems.

- **Infinite Commons** defines deterministic shared artifact handoffs.
- **Infinite Porch** provides governed peer identity, networking, messaging, storage, compute, and model routing.

They may integrate, but neither project is required to run the other.

## License

MIT. See [LICENSE](LICENSE).
