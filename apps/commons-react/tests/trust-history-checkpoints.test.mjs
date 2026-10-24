import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  newTrustLedger, addTrustKey, changeTrustKeyStatus, exportTrustLedger, importTrustLedger
} from "../src/operatorTrustLedger.mjs";
import {
  TRUST_CHECKPOINT_SCHEMA, TRUST_CHECKPOINT_FILENAME, TRUST_CHECKPOINT_MAX_BYTES,
  canonicalTrustEvent, trustHistoryHeads, createTrustCheckpoint,
  inspectTrustCheckpoint, parseTrustCheckpoint, exportTrustCheckpoint,
  compareTrustCheckpoint
} from "../src/trustHistoryCheckpoints.mjs";

const A = "a".repeat(64), B = "b".repeat(64);
const signKey = (ledger, key, label) => addTrustKey(ledger, {
  fingerprint: key, label, sourceNote: "Checked against an independently held printed card.",
  independentlyChecked: true
});
const close = (ledger, key) => changeTrustKeyStatus(ledger, {
  fingerprint: key, action: "REVOKE", reason: "Suspected key compromise after inspection.",
  confirmed: true
});
const subtle = webcrypto.subtle;

test("R11 exact exported checkpoint is stable across JSON member order and whitespace", async () => {
  assert.equal(TRUST_CHECKPOINT_SCHEMA, "commons.operator-trust-checkpoint.v0.11");
  assert.equal(TRUST_CHECKPOINT_FILENAME, "commons-key-history-checkpoint.json");
  let history = signKey(newTrustLedger(), A, "Primary key");
  history = close(history, A);
  const first = await createTrustCheckpoint(history, subtle);
  assert.equal(first.eventCount, 2);
  assert.match(first.headSha256, /^[a-f0-9]{64}$/);
  assert.ok(Object.isFrozen(first));
  const exported = exportTrustCheckpoint(first);
  assert.deepEqual(parseTrustCheckpoint(exported), first);
  const reordered = JSON.parse(exportTrustLedger(history));
  reordered.events = reordered.events.map(e => ({
    replaces:e.replaces, sourceNote:e.sourceNote, fingerprint:e.fingerprint,
    label:e.label, action:e.action, sequence:e.sequence
  }));
  const reimported = importTrustLedger(JSON.stringify(reordered, null, 7));
  assert.equal((await createTrustCheckpoint(reimported, subtle)).headSha256, first.headSha256);
  assert.ok(canonicalTrustEvent(reordered.events[0]).startsWith("[1,"));
});

test("R11 detects deleted revocation, truncated old backups and tampered reason with independent reference", async () => {
  let old = signKey(newTrustLedger(), A, "Primary");
  const oldest = await createTrustCheckpoint(old, subtle);
  const latestHistory = close(old, A);
  const latestRef = await createTrustCheckpoint(latestHistory, subtle);
  assert.equal((await compareTrustCheckpoint(latestHistory, latestRef, subtle)).result, "EXACT_CHECKPOINT_MATCH");
  const past = await compareTrustCheckpoint(old, latestRef, subtle);
  assert.equal(past.result, "ROLLBACK_RELATIVE_TO_REFERENCE");
  assert.equal(past.prefixMatch, false);
  const fake = JSON.parse(exportTrustLedger(latestHistory));
  fake.events[1].sourceNote = "Deliberately concealed evidence!";
  const tampered = await compareTrustCheckpoint(importTrustLedger(JSON.stringify(fake)), latestRef, subtle);
  assert.equal(tampered.result, "HISTORY_DIVERGED_FROM_REFERENCE");
  assert.equal(tampered.prefixMatch, false);
  assert.equal((await compareTrustCheckpoint(old, oldest, subtle)).result, "EXACT_CHECKPOINT_MATCH");
  // An old authentic reference cannot prove that the newer revocation exists!
  assert.equal((await compareTrustCheckpoint(old, oldest, subtle)).prefixMatch, true);
});

test("R11 recognizes legitimate append-only extensions and rejects changed historical prefix", async () => {
  const base = signKey(newTrustLedger(), A, "First");
  const reference = await createTrustCheckpoint(base, subtle);
  const withRevoke = close(base, A);
  const extended = signKey(withRevoke, B, "Replacement");
  const verdict = await compareTrustCheckpoint(extended, reference, subtle);
  assert.equal(verdict.result, "CHECKPOINT_PREFIX_MATCHES_WITH_NEW_EVENTS");
  assert.equal(verdict.currentCount, 3);
  assert.equal(verdict.referenceCount, 1);
  const changed = JSON.parse(exportTrustLedger(extended));
  changed.events[0].sourceNote = "Tampered at the beginning.";
  assert.equal((await compareTrustCheckpoint(importTrustLedger(JSON.stringify(changed)), reference, subtle)).result,
    "HISTORY_DIVERGED_FROM_REFERENCE");
  const heads = await trustHistoryHeads(extended, subtle);
  assert.equal(heads.length, 4);
  assert.equal(heads[1], reference.headSha256);
});

test("R11 invalid references are refused, including self-certifying flags", () => {
  const reference = {
    schema:TRUST_CHECKPOINT_SCHEMA, algorithm:"SHA-256",
    historySchema:"commons.operator-trust-key-history.v0.10",
    eventCount:2, headSha256:"1".repeat(64),
    domain:"COMMONS_OPERATOR_TRUST_HISTORY_V11"
  };
  assert.deepEqual(inspectTrustCheckpoint(reference), reference);
  assert.throws(() => parseTrustCheckpoint("{"), /Malformed/);
  assert.throws(() => parseTrustCheckpoint(""), /nonempty/);
  assert.throws(() => parseTrustCheckpoint("x".repeat(TRUST_CHECKPOINT_MAX_BYTES + 1)), /under 2 KiB/);
  for (const modified of [
    {algorithm:"SHA-1"},{schema:"other"}, {eventCount:101}, {eventCount:1.5},
    {eventCount:-1}, {headSha256:"0".repeat(63)}, {domain:"MALICIOUS"},
    {trustGranted:true}, {signerVerified:true}, {independentTimeTrusted:true}
  ]) assert.throws(() => inspectTrustCheckpoint({...reference,...modified}), /Invalid or unsupported/);
});

test("R11 never grants authority and does not authenticate an attacker-provided reference", async () => {
  const ledger = newTrustLedger();
  const fakeButWellFormed = await createTrustCheckpoint(ledger, subtle);
  const output = await compareTrustCheckpoint(ledger, fakeButWellFormed, subtle);
  assert.equal(output.result, "EXACT_CHECKPOINT_MATCH");
  assert.equal(output.independentlyAuthenticated, false);
  assert.equal(output.trustAuthorityGranted, false);
  assert.match(output.note, /NOT authenticated/);
  const emptyHeads = await trustHistoryHeads(ledger, subtle);
  assert.equal(emptyHeads.length, 1);
  assert.notEqual(emptyHeads[0], "0".repeat(64));
});
