# Infinite Commons Rung 8 · Kernel Replay Receipt Desk

**Status:** read-only, local-byte comparison of an **unsigned** verification report from ThinkTank's new `council:verify` CLI. The real replay happens in the separately installed ThinkTank kernel, **not in the public Commons browser**.

## Paired source changes

- **ThinkTank PR #52:** https://github.com/MichaelWave369/think-tank/pull/52
  - Adds `npm run council:verify -- /path/to/council-ledger.json [/path/to/decision-dossier.json]`.
  - Uses actual `src/kernel/eventKernel.ts` replay against `createInitialState()`; verifies event sequence, pre/post state fingerprints and governance transitions.
  - Optionally matches the standalone dossier against the kernel-reconstructed final dossier.
  - Exports `replay-verification-*.json` containing exact **raw input file SHA-256** values, verified event/fingerprint metadata, and explicit zero-authority labels.
  - No network, model execution, inference approvals, remote services or private keys.
- **Commons PR #25:** this optional local report viewer, entirely browser-side.

## Operator workflow

1. Use the existing Commons R6 desk to author a local ThinkTank contract. Inspect/approve/run it using the separately installed ThinkTank terminal CLI.
2. Use ThinkTank's independently installed **R8** `council:verify` to replay its exported ledger and, if present, dossier. Read its local report and confirm the command exited successfully.
3. Return to Commons R7/R8. Select the exact `*-ledger.json`, optional `*-decision-dossier.json`, and optional new `replay-verification-*.json`.
4. Commons calculates **SHA-256 locally in the browser over the exact uploaded file bytes**. It compares those digests against the receipt, along with session, mode, model, contract digest, event count and optional dossier ID/session.
5. Any mismatch is labeled **MISMATCH**. Even when all checks match, the result is labeled **BYTE-BOUND SELF-ATTESTED KERNEL REPORT** and **NOT AUTHENTICATED**.

A receipt that says `KERNEL_REPLAY_PASS` does not itself prove the verifier ran. The separate ThinkTank CLI must be run on a trusted local system; Commons cannot attest that fact from an unsigned JSON document.

## No promotion of authority

- No real-time link to `127.0.0.1:3691`, Ollama, ThinkTank or any public/private agent.
- A matching report does **not** establish authorship, real model execution, valid statements, signed publication, trusted chronology, external DONE, approvals, STATION completion, evidence verification, or account permissions.
- Original Dossier fingerprints are FNV-1a32: deterministic replay checksums, **not cryptographic signatures**.
- SHA-256 binds the report to a particular ledger/dossier **byte sequence**, not to an authenticated creator. A malicious author can fabricate all three files.
- Report data is displayed as escaped React text, never HTML, never used as URLs or commands.
- Files are read only by the local browser with bounded sizes (ledger/dossier max 2 MiB, report max 64 KiB). Selection state clears on refresh or **Clear all local review data**. Nothing is uploaded or persisted.

## Tests

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Tests include strict report grammar, refusal of authority-elevating fields, exact SHA comparison, changed file negative controls, optional-dossier linkage, browser file uploads, no provider traffic, mobile rejection/clear behavior, and existing Commons/STATION regression suites. Browser samples are synthetic and do **not** claim a real local model ran.

**Next potential rung:** operator-trusted signer identity or bundled verified kernel (with independent reproducibility), pursued separately. Neither should silently grant execution or factual authority.

**Ledger Above Ego · No Thrones · STATIONNNNN!**
