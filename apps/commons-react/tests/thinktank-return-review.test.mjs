import test from "node:test";
import assert from "node:assert/strict";
import {
  RETURN_DESK_VERSION, LEDGER_SCHEMA, RETURN_MAX_BYTES,
  parseLocalReturnJson, reviewLocalLedger, reviewLocalDossier,
  dossierChecksum, compareLocalReturn
} from "../src/thinkTankReturnReview.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";

function exampleDossier() {
  const obj = {
    id: "DOS-0003", sessionId: "session-local-test", seed: "not-a-security-key",
    decisionSeq: 3, mode: "audit", executionSource: "live-provider",
    operatorPrompt: "Audit the proposed tests", outcome: "withheld", outputLabel: "WITHHELD",
    actionAllowed: false, gateScore: 0.6, gateThreshold: 0.75,
    gateBreakdown: null, claimGovernance: null, argumentGovernance: null,
    objectionCount: 1, faultCode: "", governanceReason: "Not enough external evidence",
    assignments: [], claims: [], bindings: [], evidence: [], excerpts: [],
    claimReviews: [], argumentReviews: [],
    providerTurns: [
      { seq: 1, roleId: "challenger", seatId: "local", providerModel: "gemma3:12b", providerRequestId: "" },
      { seq: 2, roleId: "archivist", seatId: "local", providerModel: "gemma3:12b", providerRequestId: "" }
    ]
  };
  obj.basisFingerprint = dossierChecksum(obj);
  return obj;
}
function exampleLedger(dossier = exampleDossier()) {
  return {
    schema: LEDGER_SCHEMA,
    contractSha256: "a".repeat(64),
    summary: { completed: true, aborted: false, error: null, turnsInvoked: 2, mode: "audit", model: "gemma3:12b" },
    authority: { executionAuthorityGranted: false, externalDoneAttested: false, independentEvidenceVerified: false, provider: "ollama-local-only" },
    replay: { valid: true, exact: true },
    events: [
      { seq: 1, sessionId: "session-local-test", kind: "challenge.raised", source: "provider", roleId: "challenger", seatId: "local", providerModel: "gemma3:12b" },
      { seq: 2, sessionId: "session-local-test", kind: "utterance.complete", source: "provider", roleId: "archivist", seatId: "local", providerModel: "gemma3:12b" },
      { seq: 3, sessionId: "session-local-test", kind: "synthesis.withheld", source: "system", decisionDossier: dossier }
    ]
  };
}

test("R7 recognizes canonical ThinkTank TT-35 output shape and only labels self reports", () => {
  assert.equal(RETURN_DESK_VERSION, "commons.thinktank-return.format-review-v0.7");
  const ledger = reviewLocalLedger(exampleLedger());
  assert.equal(ledger.schema, "phi-thinktank-local-council-result.v0.1");
  assert.equal(ledger.mode, "audit");
  assert.equal(ledger.turnsInvokedReported, 2);
  assert.equal(ledger.providerTurns.length, 2);
  assert.equal(ledger.replayExactReported, true);
  assert.match(ledger.trustLevel, /UNTRUSTED/);
  const dossier = reviewLocalDossier({ dossier: exampleDossier(), override: null, seals: [] });
  assert.equal(dossier.basisChecksumMatches, true);
  assert.equal(dossier.outcomeClaimed, "withheld");
  assert.equal(dossier.actionAllowedClaimed, false);
  assert.match(dossier.trustLevel, /NOT CRYPTOGRAPHIC/);
  const comparison = compareLocalReturn(ledger, dossier);
  assert.equal(comparison.consistent, true);
  assert.equal(comparison.checks.length, 5);
  assert.match(comparison.level, /NOT AUTHENTICITY/);
});

test("tampered dossier checksum and mismatched session/decision are visible as failures", () => {
  const original = exampleDossier();
  const tampered = { ...original, operatorPrompt: "FORGED APPROVAL", actionAllowed: true };
  const inspected = reviewLocalDossier({ dossier: tampered, override: { id: "OVR-99" }, seals: [] });
  assert.equal(inspected.basisChecksumMatches, false);
  assert.ok(inspected.validationWarnings.some(s => s.includes("checksum")));
  assert.ok(inspected.validationWarnings.some(s => s.includes("Commons does not adopt")));
  const ledger = reviewLocalLedger(exampleLedger());
  assert.equal(compareLocalReturn(ledger, inspected).consistent, false);
  const swapped = { ...original, sessionId: "another-run" };
  swapped.basisFingerprint = dossierChecksum(swapped);
  const mismatched = reviewLocalDossier({ dossier: swapped });
  assert.equal(compareLocalReturn(ledger, mismatched).consistent, false);
});

test("malformed ledgers, authority promotions, event ordering and remote seats fail closed", () => {
  assert.throws(() => reviewLocalLedger(null), /object/);
  assert.throws(() => reviewLocalLedger({ schema: "other" }), /TT-35/);
  const base = exampleLedger();
  assert.throws(() => reviewLocalLedger({ ...base, authority: { ...base.authority, externalDoneAttested: true } }), /zero-external-authority/);
  assert.throws(() => reviewLocalLedger({ ...base, events: [base.events[1], base.events[0]] }), /strictly increasing/);
  assert.throws(() => reviewLocalLedger({ ...base, events: [{ ...base.events[0], seatId: "openai" }] }), /local seat/);
  assert.throws(() => reviewLocalLedger({ ...base, events: [base.events[0], { ...base.events[1], sessionId: "forged" }] }), /Mixed/);
  assert.throws(() => reviewLocalLedger({ ...base, summary: { ...base.summary, turnsInvoked: 8 } }), /Out-of-budget/);
  assert.throws(() => reviewLocalLedger({ ...base, replay: { exact: "true", valid: true } }), /boolean/);
});

test("arbitrary JSON, oversized or incomplete dossiers are not promoted into reviews", () => {
  assert.deepEqual(parseLocalReturnJson('{"value":1}'), { value: 1 });
  assert.throws(() => parseLocalReturnJson(""), /nonempty/);
  assert.throws(() => parseLocalReturnJson("{"), /Invalid JSON/);
  assert.throws(() => parseLocalReturnJson("x".repeat(RETURN_MAX_BYTES + 1)), /smaller/);
  assert.throws(() => reviewLocalDossier({ dossier: { id: "DOS-3" } }), /Dossier session ID/);
  assert.throws(() => reviewLocalDossier({ dossier: { ...exampleDossier(), providerTurns: [{ roleId: "forged", seatId: "openai", seq: 1 }] } }), /provider-turn metadata/);
});

test("return reviewer neither revises canonical Commons world nodes nor the R6 export contract", () => {
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(WORLD_NODES.map(node => node.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
  assert.equal(compareLocalReturn(null, null), null);
});
