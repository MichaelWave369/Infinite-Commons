# Legacy Pantheon Compatibility

Infinite Commons began as a private downstream consumer for a Phi-Pantheon artifact handoff. That history is preserved, but it is no longer the project's defining architecture.

## Current rule

New producers should write the canonical contract:

`commons_data/bootstrap/latest_contract.json`

Infinite Commons also accepts the historical contract path:

`pantheon_data/bootstrap/commons/latest_contract.json`

This fallback exists so older local workflows can migrate without breaking immediately.

## Precedence

If both files exist, the canonical `commons_data/` contract is used.

## What compatibility does not mean

Legacy support does **not** make Phi-Pantheon:

- a required dependency
- an authority over Commons
- a required runtime
- a required repository layout
- the only supported producer

Any tool capable of writing the documented Commons contract and referenced artifacts can produce inputs for Infinite Commons.

## Migration

A legacy producer can migrate by:

1. Writing its contract to `commons_data/bootstrap/latest_contract.json`.
2. Moving or regenerating referenced artifacts under a producer-chosen repository-relative location.
3. Updating artifact `path` values in the contract.
4. Running `commons bootstrap-check`.
5. Removing the legacy contract after downstream consumers have migrated.

The legacy fallback may be deprecated in a future major version, but no removal date is set in 0.1.x.
