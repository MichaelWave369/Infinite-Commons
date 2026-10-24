# Infinite Commons Rung 11 · Independently Held Trust-History Checkpoints

**Status:** deterministic SHA-256 hash-chain commitments for the local R10 public-key history journal, plus human-operated comparison with a **separately saved** checkpoint. This adds conditional tamper/rollback detection, **not** automatic identity, guaranteed latest-history knowledge, trusted timestamps, third-party signatures, consensus or global revocation.

## Why R11 exists

The R10 journal can be exported, modified and restored. A forged old journal could omit a revoked signing key, causing that key to appear ACTIVE in the *local* journal. Adding a checksum inside that same editable journal would be useless against an attacker able to alter both content and checksum.

R11 creates a separate **versioned checkpoint** representing a verified prefix of the event journal. Its meaningful security property comes from the operator keeping the event count and hash in a **separate, independently retained place**. A physical note, independent device, trusted witness record or separate verified archival location can act as the reference. R11 does not create or secure that external storage automatically.

## Commitment algorithm

Implemented in `src/trustHistoryCheckpoints.mjs` using browser WebCrypto `SHA-256`, with strict typed input from R10's `inspectTrustLedger`.

1. Domain string: `COMMONS_OPERATOR_TRUST_HISTORY_V11`.
2. Genesis: `SHA256(UTF8(domain + "\n" + historySchema + "\nGENESIS"))`.
3. Each event has one fixed field order: `[sequence,action,fingerprint,label,sourceNote,replaces]`. The serialized bytes are `JSON.stringify` of this ordered array. An imported JSON object's arbitrary property order or whitespace does not affect the commitment.
4. For each event: `H_i = SHA256(UTF8(domain + "\n" + H_(i-1) + "\n" + canonicalEvent))`.
5. Checkpoint: strict v0.11 schema with `algorithm:SHA-256`, `eventCount`, `headSha256`, the R10 history schema and the domain string.

The SHA-256 history commits to exact operator-submitted event text and order. It does not authenticate whether those human notes are true or whether the original author truly checked a key.

## Operator workflow

1. Maintain R10 key-history records as before. Whenever revocation or rotation is important, choose **Compute current history checkpoint**.
2. Copy the **64-character SHA-256 head and event count** into a separate trusted storage location. Optionally download `commons-key-history-checkpoint.json`, but remember that an ordinary downloaded file is unsigned and can be replaced.
3. On later visits, restore the exported R10 history through its explicit warning/confirmation flow.
4. **Type** the externally retained event count and head in the R11 comparison form. Explicitly confirm it came from separately retained storage.
5. Inspect one of four states:

| Result | Meaning |
| --- | --- |
| `EXACT_CHECKPOINT_MATCH` | Current journal exactly reaches the supplied prefix |
| `CHECKPOINT_PREFIX_MATCHES_WITH_NEW_EVENTS` | Independently retained historical prefix matches, and newer events exist |
| `ROLLBACK_RELATIVE_TO_REFERENCE` | Journal has fewer events than the supplied checkpoint. It may be an older backup |
| `HISTORY_DIVERGED_FROM_REFERENCE` | At the reference event count, the SHA-256 head does not match. The recorded history differs |

**Important:** A successful match of an old checkpoint does not prove that there are no newer revocations. Only a legitimately independently retained *recent enough* reference helps identify an attacker’s restoration of older history. The browser cannot tell which reference is genuinely the most recent.

## Trust and security boundaries

- No server-side state, private keys, model calls, API endpoints, browser storage, external trust registry, automatic signature verification, trusted timestamps, or authority grants.
- The separately retained checkpoint itself is **not signed by R11**. Attacker-controlled checkpoint + attacker-controlled journal can match perfectly.
- The latest generated checkpoint is displayed locally but is **not silently auto-promoted** into the comparison's trusted reference. The operator must type their external reference manually.
- All computation is on the current page; comparison state resets when journal events change, when R9 Return Desk is cleared, or on browser refresh.
- This does not change the R10 revocation veto, R9 Ed25519 signature mathematics, R8 kernel replay receipt, R6/7 council handoffs, portal experiences or original five-seat STATION ceremony.
- Signed/witnessed checkpoint publication, verified key distribution, independent time anchoring, anti-rollback persistence, and multi-device synchronization remain separate future work.

## Tests

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Unit tests check fixed canonicalization, whitespace/object-order invariance, exact and prefix matches, altered notes, deleted revocations and old backups, forged checkpoint fields, and non-authority labels.

Real Chromium tests generate a current checkpoint, download its exact JSON, revoke a key, verify a legitimate prefix extension, then restore an older key journal and prove it is older than the independently supplied checkpoint. A separate mobile test detects edited key notes and preserves the existing STATION UI.

**Ledger Above Ego. A hash isn't trust; an independently held reference is the missing ingredient.**
