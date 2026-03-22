# Commons Bootstrap Contract (Local)

Infinite Commons consumes Pantheon-produced bootstrap data from local disk only.

## Canonical contract location

- `pantheon_data/bootstrap/commons/latest_contract.json`

## Minimal contract shape consumed in this phase

```json
{
  "target": "commons",
  "channel_name": "stable",
  "candidate_id": "cand-001",
  "artifacts": [
    {
      "name": "commons_manifest",
      "path": "pantheon_data/consumers/commons/manifest.json",
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
- Relative artifact paths are resolved against repository root.
- Absolute paths are rejected for deterministic local safety.

## Failure classes

- Missing latest contract path.
- Missing required artifact.
- Malformed contract JSON or artifact JSON.
- Unreadable paths.
