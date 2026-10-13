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

The core library remains deliberately small: there is no server, OAuth flow, remote API, or background synchronization. A separate **local-only, optional browser experience prototype** now lives in `web/`; it does not confer any network or artifact authority.

## Commons Experience: Midnight Sierra (prototype)

The optional [Commons Experience v0.1](docs/COMMONS_EXPERIENCE_V0_1.md) adds a
standalone illustrated arrival terrace, twenty appearance presets (two curated
scene treatments, eighteen palette previews), a style switcher, and three
**offline sample** hotspots for a Commons plaza, BBS and PhiSpace. It is not a
live Porch, social network or VR application.

Try it locally without adding dependencies:

```sh
python -m http.server 8000 --directory web
# visit http://127.0.0.1:8000/
```

Test the presentation contract with
`node --test web/tests/experience.test.mjs`. The Python bootstrap proof and
existing permissions remain unchanged.

## PhiSpace doorway: public manifest demo

The [PhiSpace public manifest v0.1](docs/PHISPACE_PUBLIC_V0_1.md) adds a
read-only **fictional example home** to the Commons Experience. Clicking its
doorway loads a fixed **same-origin** JSON fixture, validates a small allowlisted
public presentation shape, and displays plain-text visitor content. Missing or
invalid fixtures fail closed.

This is **not** a live Infinite Porch connection or an authorization proof.
A `public` field in a manifest is merely a claim. Explicit owner-controlled
publishing, authentication, revocation, real accounts, BBS posting and WebXR
still require separate design and verification.

## Owner-curated PhiSpace offline export (candidate)

The optional [PhiSpace owner-curated export guide](docs/PHISPACE_OWNER_EXPORT_V0_1.md)
shows how to manually select visitor-facing public text, preview its complete
JSON and SHA-256 digest, and explicitly approve a **local** export file.

```sh
python -m infinite_commons.phispace_publisher preview --draft path/to/manual-draft.json
```

The CLI never scans an Infinite Porch, performs network requests or
automatically publishes any content. The exported
`owner-curated-export` artifact is **not accepted by the v0.1 browser
demo**, which remains locked to its fictional local fixture. A hash check
is not a verified identity or signature.

## Local preview of owner-curated PhiSpace exports (candidate)

The [PhiSpace local preview v0.1](docs/PHISPACE_LOCAL_PREVIEW_V0_1.md)
connects the browser demo to a **user-selected** offline JSON export.
Choose the file explicitly in the browser, see its plain-text public
profile as an **unverified local preview**, or withdraw it from the
current tab. No network publishing, private Porch access, cloud sync,
identity verification, or persistent directory is added.

Withdrawal only clears this one local session. It **cannot revoke content
already published or copied elsewhere**; true distributed revocation needs
a separately reviewed protocol.

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
