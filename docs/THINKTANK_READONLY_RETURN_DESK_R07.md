# Infinite Commons R7 · ThinkTank Read-only Return Desk

**Status:** local-file *format review only*, no independent provider authentication, cryptographic seal verification, event replay, provenance promotion, or permissions.

## Grounding

Reviewed ThinkTank code on October 23, 2026:

- [Local council CLI](https://github.com/MichaelWave369/think-tank/blob/main/scripts/local-council-entry.ts): writes a `phi-thinktank-local-council-result.v0.1` `*-ledger.json` with `contractSha256`, `summary`, `authority`, `replay`, and `events`. When synthesis produces a dossier, it writes a separate `*-decision-dossier.json` using `localCouncilDossierExport`.
- [ThinkTank decision basis](https://github.com/MichaelWave369/think-tank/blob/main/src/domain/decisionDossier.ts): `basisFingerprint` uses sorted-key FNV-1a32 on the dossier basis. This is only a deterministic checksum and is not secure against forgery.
- [ThinkTank dossier types](https://github.com/MichaelWave369/think-tank/blob/main/src/domain/types.ts): dossier `id`, `sessionId`, `decisionSeq`, `mode`, `executionSource`, `outcome`, `actionAllowed`, and reference arrays.

The public Commons is **not** the ThinkTank runtime; nothing in this release fetches or executes the ThinkTank CLI, provider bridge or cryptographic verification chain.

## Visitor journey

After independently running the R6 approved local council request using ThinkTank's CLI, a user can select up to two *local JSON files* inside the **ThinkTank Return Desk**, directly below the R6 outbound contract desk.

1. Choose the local **ledger JSON**. The browser inspects only the bounded file contents, lists reported mode/model, provider-turn labels, self-reported replay flags, completion state, and the contract digest *as declared by the file*.
2. Optionally choose the matching **decision-dossier JSON**. Some legitimate runs have no dossier. The browser inspects declared outcome, model provenance labels, authority claim, object counts and the deterministic basis FNV checksum. The checksum is **not a signature**.
3. If both files exist, the viewer checks matching session ID, mode, decision identity/fingerprint, checksum consistency and whether dossier provider turns correspond to matching ledger labels. These are **structural comparisons**, not independent attestations or event replays.
4. **Clear all local review data** discards the parsed views and resets both file inputs. Refresh also clears state. No data is saved to localStorage or sent to an API.

All values derived from uploaded text are displayed as React text nodes. There is no `dangerouslySetInnerHTML`, remote rendering, automatic link creation from file contents, object execution, or promotion to STATION, ThinkTank authority, PhiSpace or Commons publishing.

## Explicitly limited verification

- **No independent event replay**: `replay.exact` and `replay.valid` are *self-reported values read from the untrusted file*. To independently replay a ledger, use the actual installed ThinkTank kernel, not this simple browser summary.
- **No cryptographic verification**: `basisFingerprint` is reproducible but unkeyed FNV-1a32. Any party can recalculate it on a fabricated dossier. We do not verify Ed25519 signatures, RFC 3161 timestamps, witness keys, external publications, or identity receipts included in optional exports.
- **No evidence truth determination**: `machine-verified` would at best label a retrieval provenance claim in an untrusted file. This desk does not fetch sources or establish their factual truth.
- **No imported authority**: `actionAllowed: true`, `completed: true`, or a human override inside a supplied file does not cause a Commons action or make an AI statement authoritative.
- **No runtime access**: the static website never calls `http://127.0.0.1:3691`, local Ollama, or any model provider.

The file inputs accept only **2 MiB or smaller JSON**. The viewer constrains event counts, schema, monotonic sequences, mode/role/seat/model declarations and rejects inconsistent or elevated local-only authority fields. The file can still be forged by an attacker and remains explicitly labeled **UNTRUSTED**.

## Verification

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

The Node suite covers fake/malformed/oversized inputs, elevated authority, wrong role/model, sequences, FNV mutation detection, and mismatched pairings. Chromium tests use local Playwright-generated mock JSON files to exercise browser file inputs, reported values, visible warning labels, comparison, clearing and mobile behavior, with zero provider requests. **Mock fixtures are not proof any real Ollama model ran.**

**MANY MINDS. NO THRONES. LEDGER ABOVE EGO. STATIONNNNN!!!**
