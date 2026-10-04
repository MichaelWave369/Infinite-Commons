# Commons Bootstrap Contract

Infinite Commons consumes a deterministic bootstrap contract plus repository-relative artifacts from local disk.

The contract is intentionally producer-agnostic. Any application can generate it.

## Canonical contract location

`commons_data/bootstrap/latest_contract.json`

For compatibility with the earliest internal prototype, the loader also accepts:

`pantheon_data/bootstrap/commons/latest_contract.json`

The canonical path has priority when both exist.

## Minimal contract

```json
{
  "target": "commons",
  "channel_name": "stable",
  "candidate_id": "cand-001",
  "artifacts": [
    {
      "name": "commons_manifest",
      "path": "commons_data/artifacts/manifest.json",
      "required": true,
      "load_order": 10
    }
  ]
}
```

## Semantics

- `artifacts` are loaded in ascending `load_order`.
- `required=true` artifacts must exist and parse as JSON.
- `required=false` artifacts produce warnings if missing.
- Artifact paths are resolved relative to the supplied repository root.
- Absolute paths are rejected.
- Parent traversal such as `../` is rejected.
- Producers do not receive execution authority merely by supplying a contract.

## Failure classes

- Missing canonical and legacy contract paths.
- Missing required artifact.
- Malformed contract JSON.
- Malformed artifact JSON.
- Unsafe artifact path.
- Unreadable path.

## Compatibility

The legacy Pantheon path remains a read-only compatibility input. New producers should write the canonical `commons_data/` layout.

See [PANTHEON_COMPATIBILITY.md](PANTHEON_COMPATIBILITY.md).
