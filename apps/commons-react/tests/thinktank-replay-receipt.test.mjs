import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  REPLAY_RECEIPT_SCHEMA, REPLAY_RECEIPT_VERSION, REPLAY_RECEIPT_MAX_BYTES,
  parseReplayReceipt, compareReplayReceipt
} from "../src/thinkTankReplayReceipt.mjs";

const hash = text => createHash("sha256").update(text).digest("hex");
const fixture = () => ({
  schema: REPLAY_RECEIPT_SCHEMA,
  execution: "LOCAL_KERNEL_REPLAY_ONLY",
  result: "KERNEL_REPLAY_PASS",
  replayKernel: "think-tank/src/kernel/eventKernel.ts",
  ledgerSha256: hash("test-ledger-file-bytes"),
  dossierSha256: null,
  contractSha256: hash("operator-reviewed-contract"),
  finalFingerprint: "fnv1a32:11111111",
  mode: "council",
  model: "gemma3:12b",
  sessionId: "PHI-0001",
  eventCount: 2,
  providerTurnCount: 1,
  dossierId: null,
  dossierMatch: "NOT_SUPPLIED",
  authGranted: false,
  externalDone: false,
  truthAuthority: false,
  signerAuthenticated: false,
  independentlyAuthenticated: false,
  verifierOrigin: "local-operator-computer",
  localClockTrust: "untrusted-local-clock"
});
const ledger = () => ({
  mode: "council", model: "gemma3:12b",
  sessionId: "PHI-0001", eventCount: 2, contractSha256: hash("operator-reviewed-contract")
});

test("R8 accepts strict unsigned TT-35 receipt and binds exact local byte digests", () => {
  assert.equal(REPLAY_RECEIPT_VERSION, "commons.kernel-replay-receipt.review-v0.8");
  const receipt = parseReplayReceipt(JSON.stringify(fixture()));
  assert.ok(Object.isFrozen(receipt));
  assert.equal(receipt.result, "KERNEL_REPLAY_PASS");
  assert.match(receipt.trustLabel, /NOT AUTHENTICATED/);
  const result = compareReplayReceipt(receipt, ledger(), receipt.ledgerSha256, null, null);
  assert.equal(result.allChecksMatch, true);
  assert.equal(result.checks.length, 9);
  assert.match(result.label, /NO SIGNER AUTHENTICATION/);
  assert.ok(Object.isFrozen(result.checks));
});

test("changed artifact bytes, session, mode or contract digest produce negative checks", () => {
  const receipt = parseReplayReceipt(JSON.stringify(fixture()));
  assert.equal(compareReplayReceipt(receipt, ledger(), hash("changed-ledger"), null, null).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, { ...ledger(), sessionId: "different" }, receipt.ledgerSha256, null, null).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, { ...ledger(), mode: "audit" }, receipt.ledgerSha256, null, null).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, { ...ledger(), contractSha256: hash("different") }, receipt.ledgerSha256, null, null).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, null, null, null, null).allChecksMatch, false);
});

test("dossier-attached receipts demand exact dossier hash and matching identity", () => {
  const claim = fixture();
  claim.dossierSha256 = hash("actual-dossier-bytes");
  claim.dossierId = "DOS-0042";
  claim.dossierMatch = "EXACT";
  const receipt = parseReplayReceipt(JSON.stringify(claim));
  assert.equal(compareReplayReceipt(receipt, ledger(), claim.ledgerSha256, null, null).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, ledger(), claim.ledgerSha256,
    { id: "DOS-0042", sessionId: "PHI-0001" }, hash("fake-dossier")).allChecksMatch, false);
  assert.equal(compareReplayReceipt(receipt, ledger(), claim.ledgerSha256,
    { id: "DOS-0042", sessionId: "PHI-0001" }, claim.dossierSha256).allChecksMatch, true);
});

test("forged elevated authority, malformed fields and oversized files fail closed", () => {
  assert.throws(() => parseReplayReceipt(""), /nonempty/);
  assert.throws(() => parseReplayReceipt("{"), /Invalid replay/);
  assert.throws(() => parseReplayReceipt("x".repeat(REPLAY_RECEIPT_MAX_BYTES+1)), /64 KiB/);
  assert.throws(() => parseReplayReceipt(JSON.stringify({ schema: "bogus" })), /Unsupported/);
  for (const forbidden of [
    { authGranted: true }, { externalDone: true }, { truthAuthority: true },
    { signerAuthenticated: true }, { independentlyAuthenticated: true },
    { verifierOrigin: "authenticated-cloud-key" }, { execution: "LIVE_EXECUTION" },
    { ledgerSha256: "0".repeat(63) }, { dossierMatch: "EXACT" }, { eventCount: -1 },
    { result: "KERNEL_REPLAY_FAIL" }
  ]) assert.throws(() => parseReplayReceipt(JSON.stringify({ ...fixture(), ...forbidden })), /Unsupported/);
});
