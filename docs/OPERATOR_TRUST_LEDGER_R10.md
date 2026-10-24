# Infinite Commons Rung 10 · Operator Trust Ledger

**Status:** an opt-in, in-memory, manually operated **public-key history notebook** for the Commons R9 Ed25519 signature desk. **Not** a central PKI, certificate authority, witnessed transparency log, cryptographic revocation certificate, timestamp service, or durable identity system.

## The key continuity problem

R9 authenticates the **mathematics of an Ed25519 signature** over the exact R8 replay-report SHA-256, and permits the visitor to manually pin a trusted SPKI public-key fingerprint acquired through an independent source. Without additional history, the visitor cannot readily record that a once-familiar key has since been retired or revoked.

R10 provides a bounded, append-only **operator-authored in-page history**. It records public-key fingerprint observations and transitions in sequence order, without using real-world time as authoritative evidence.

- **ADD:** requires an exact lowercase 64-hex Ed25519 SPKI SHA-256 public-key fingerprint, human-readable key label, note identifying how the operator independently checked the fingerprint, and explicit acknowledgment. Registering a key **does not automatically pin** it or authorize any signature.
- **RETIRE:** requires selection of an ACTIVE key, a reason, and explicit operator confirmation. Used for intentional rotation. Retired keys cannot be reactivated within the same journal.
- **REVOKE:** same explicit operator controls, but marks suspected compromise or a prohibition on future local key pinning. Revoked keys cannot be reactivated within the same journal.
- **ROTATION LINK:** after closing an old key, a *separately and independently checked* new public key can be registered with a `replaces` reference to the closed key. The new key inherits **no permissions, identity or trust** from its predecessor.

Both RETIRED and REVOKED prevent R9's **current locally pinned trust verdict** even if the old Ed25519 signature is still mathematically valid. R9 continues to show actual signature validity separately.

## Import/export and persistence boundaries

The journal is **memory-only** and resets on browser refresh or Return Desk **Clear all local review data**. Visitors can explicitly download an ordinary, unencrypted, unsigned JSON journal as `commons-local-key-history.json`, and re-import it with a separate acknowledgment.

**An imported file is not authoritative.** Anyone can edit a JSON journal, remove a revocation, forge an independent-source note, or create a new, incomplete snapshot. Import requires an explicit confirmation, replaces the current page's journal, and clears the existing R9 pin acknowledgment. The human must independently recheck any fingerprint before claiming current trust. This is *not* a tamper-evident ledger and does not establish historical continuity across devices.

Key history has no private keys, signatures, cookies, analytics, model APIs, timestamps, remote trust services, automatic pinning, cross-device synchronization, or external approval.

## Trust assertions

| Observable state | Meaning |
| --- | --- |
| `UNKNOWN` | No record for current key in this session. R9 independent pin still necessary |
| `ACTIVE` | An operator manually logged a positive key check. **Not automatically trusted**; R9 pin remains necessary |
| `RETIRED` | Locally recorded planned closure. Current R9 trust pin must not be promoted |
| `REVOKED` | Locally recorded key disallowance. Current R9 trust pin must not be promoted |
| Imported history | Unauthenticated text, editable by anyone. No keys gain trust from import |

A malicious old snapshot can omit revocations. The operator is responsible for independent backups or witness records. This rung does **not** solve global revocation distribution.

## Tests and compatibility

- `src/operatorTrustLedger.mjs`: deterministic, frozen append-only event journal, strict JSON schema, 100-event max and 64-KiB import bound; all records checked by replay on import.
- `src/OperatorTrustLedger.jsx`: accessible local-only add/retire/revoke/rotation controls, explicit source notes and confirmations, local export/import.
- `src/ThinkTankSignatureDesk.jsx`: R9 check retains cryptographic verdict but refuses current pin promotion when the local journal status is RETIRED or REVOKED. All journal changes clear the previous manual pin acknowledgment.
- Browser and Node tests cover forging, chronology, reactivation refusal, rollback warning, rotated key relationships, actual Ed25519 signature with revoked public-key trust, import/export, reset and original STATION regression.

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

ThinkTank's original `council:sign` and `council:verify` implementations remain unchanged. There is no central revocation authority or trust registry.

**LEDGER ABOVE EGO · MANY MINDS · NO THRONES · STATIONNNNN!**
