# R9 · Commons Ed25519 Replay Signature Trust Desk

**Status:** optional browser-side cryptographic verification of a detached ThinkTank R9 signature against **the exact selected R8 replay verification file bytes**, plus a human-entered out-of-band public-key fingerprint pin. No live model access and no identity or factual authority claims.

## Companion dependency

[ThinkTank PR #53](https://github.com/MichaelWave369/think-tank/pull/53) adds an explicit `council:sign` command to generate a detached Ed25519 signature JSON for a previously generated `council:verify` R8 report. **The signer must exist locally and be separately merged and tested** for this optional workflow to function.

## Workflow

1. Use the existing R6 contract exporter, ThinkTank local `council:inspect` / `council:run`, and R8 local `council:verify` to generate a verifier report on a trusted computer.
2. Separately invoke ThinkTank `npm run council:sign -- REPORT.json PRIVATE_KEY.pem SIGNATURE.json --confirm-sign-only`. The selected local Ed25519 private key stays outside Commons and does not enter GitHub.
3. In the public Commons Return Desk, select the R8 verification report JSON and optionally the ledger/dossier it covers. Commons already checks exact SHA-256 matches between those files and the report.
4. In the new **Who signed the replay report?** desk, select the detached R9 signature JSON. Commons validates the strict schema and four zero-authority fields, decodes a fixed Ed25519 SPKI public key, calculates the DER key fingerprint with WebCrypto SHA-256, and uses **WebCrypto Ed25519** to check the domain-separated signature over the R8 report's exact SHA-256. Changing the report breaks the byte-binding even if the report fields look similar.
5. Signature mathematically valid is displayed separately from **human trust in a key**. A visitor may type a **64-character key fingerprint acquired through an independent trusted channel** and explicitly confirm that fact. The UI reports a *user-asserted key-pin match* only when all cryptographic/byte checks pass and the typed pin matches. Copying a fingerprint from the signature itself does **not** establish trust.

## Assertions this does and does not support

- **Can assert** that the provided key mathematically verifies the signature over a report hash; the signature carries the exact uploaded report bytes; and that a visitor's manually entered fingerprint matches the provided key, if and only if those independent checks pass.
- **Cannot assert** that the signer has any particular legal/real-world identity, the key has not been stolen, the local ThinkTank verifier actually ran, the AI truly generated the text, the evidence is factual, an external system authorized a request, or an independent third-party publication exists.
- The verifier report remains **self-attested unless the origin and key are established independently**. A malicious actor can generate a fresh Ed25519 key and fabricate the entire report/signature bundle.
- No network, credential, private key, API, localStorage, cookies, external permission grants, STATION ceremony, model inference, or user-specific durable ledger updates are added. All data and optional typed key pins disappear on refresh or Clear Review Data.
- This does **not** replace or bypass ThinkTank's existing signed publication, transparency, witness, release or provenance workflows.

## Tests

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Node tests use real ephemeral Ed25519 keys and validate a correct signature, wrong SHA, wrong pin, altered signature, alternate algorithm, invalid base64/key encoding, missing schema, authority elevation and oversized files. Chromium tests upload synthetic report/signature artifacts, execute actual browser WebCrypto verification and demonstrate signature validity **without** asserted identity, optional user pin match, report changes that invalidate the binding, mobile refusal of forged authority and preserved original STATION.

**Ledger Above Ego. Mathematical signatures, human trust boundaries, no thrones.**
