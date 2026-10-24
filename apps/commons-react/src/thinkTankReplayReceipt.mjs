/**
 * Commons R8: a locally generated, unsigned ThinkTank replay verification
 * report can be compared against locally uploaded artifact SHA-256 values.
 *
 * IMPORTANT: matching digests prove file-byte binding only. The report is
 * attacker-editable and self-attested. Never call it authenticated replay.
 */
export const REPLAY_RECEIPT_SCHEMA = "phi-thinktank-local-council-verification.v0.1";
export const REPLAY_RECEIPT_VERSION = "commons.kernel-replay-receipt.review-v0.8";
export const REPLAY_RECEIPT_MAX_BYTES = 64 * 1024;
const HEX_SHA = /^[a-f0-9]{64}$/;
const FNV = /^fnv1a32:[a-f0-9]{8}$/;
const plain = value => value !== null && typeof value === "object" && !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

export function parseReplayReceipt(content) {
  if (typeof content !== "string" || !content.trim() ||
      new TextEncoder().encode(content).byteLength > REPLAY_RECEIPT_MAX_BYTES)
    throw Error("The verifier report must be nonempty JSON under 64 KiB.");
  let parsed;
  try { parsed = JSON.parse(content); }
  catch { throw Error("Invalid replay verification JSON."); }
  if (!plain(parsed) || parsed.schema !== REPLAY_RECEIPT_SCHEMA ||
      parsed.execution !== "LOCAL_KERNEL_REPLAY_ONLY" ||
      parsed.result !== "KERNEL_REPLAY_PASS" ||
      parsed.replayKernel !== "think-tank/src/kernel/eventKernel.ts" ||
      !HEX_SHA.test(parsed.ledgerSha256) ||
      !(parsed.dossierSha256 === null || HEX_SHA.test(parsed.dossierSha256)) ||
      !HEX_SHA.test(parsed.contractSha256) ||
      !FNV.test(parsed.finalFingerprint) ||
      typeof parsed.sessionId !== "string" || !parsed.sessionId || parsed.sessionId.length > 180 ||
      !["council", "trio", "audit"].includes(parsed.mode) ||
      typeof parsed.model !== "string" || !parsed.model || parsed.model.length > 90 ||
      !Number.isInteger(parsed.eventCount) || parsed.eventCount < 1 || parsed.eventCount > 2000 ||
      !Number.isInteger(parsed.providerTurnCount) || parsed.providerTurnCount < 0 ||
      parsed.providerTurnCount > 5 ||
      !["EXACT", "NOT_SUPPLIED"].includes(parsed.dossierMatch) ||
      (parsed.dossierMatch === "EXACT") !== (parsed.dossierSha256 !== null) ||
      (parsed.dossierId !== null && (typeof parsed.dossierId !== "string" || parsed.dossierId.length > 80)) ||
      parsed.authGranted !== false || parsed.externalDone !== false ||
      parsed.truthAuthority !== false || parsed.signerAuthenticated !== false ||
      parsed.independentlyAuthenticated !== false ||
      parsed.verifierOrigin !== "local-operator-computer" ||
      parsed.localClockTrust !== "untrusted-local-clock") {
    throw Error("Unsupported, incomplete or authority-elevating TT-35 verifier report.");
  }
  return Object.freeze({
    schema: parsed.schema,
    result: parsed.result,
    ledgerSha256: parsed.ledgerSha256,
    dossierSha256: parsed.dossierSha256,
    contractSha256: parsed.contractSha256,
    finalFingerprint: parsed.finalFingerprint,
    mode: parsed.mode, model: parsed.model,
    sessionId: parsed.sessionId,
    eventCount: parsed.eventCount,
    providerTurnCount: parsed.providerTurnCount,
    dossierId: parsed.dossierId,
    dossierMatch: parsed.dossierMatch,
    trustLabel: "UNSIGNED OPERATOR FILE · NOT AUTHENTICATED · NO AUTHORITY"
  });
}

export function compareReplayReceipt(receipt, ledger, ledgerSha256, dossier, dossierSha256) {
  if (!receipt) return null;
  const presentLedger = ledger !== null && ledger !== undefined;
  const checks = [
    ["Ledger selected", presentLedger],
    ["Exact ledger bytes", presentLedger && HEX_SHA.test(ledgerSha256 ?? "") && receipt.ledgerSha256 === ledgerSha256],
    ["Reported mode and model", presentLedger && receipt.mode === ledger.mode && receipt.model === ledger.model],
    ["Reported ledger session", presentLedger && receipt.sessionId === ledger.sessionId],
    ["Reported ledger contract SHA", presentLedger && receipt.contractSha256 === ledger.contractSha256],
    ["Event count", presentLedger && receipt.eventCount === ledger.eventCount],
    ["Dossier supplied when declared", receipt.dossierMatch === "NOT_SUPPLIED" ||
      Boolean(dossier && dossierSha256 && receipt.dossierSha256)],
    ["Exact dossier bytes (when declared)", receipt.dossierMatch === "NOT_SUPPLIED" ||
      Boolean(dossier && HEX_SHA.test(dossierSha256 ?? "") && dossierSha256 === receipt.dossierSha256)],
    ["Dossier identity and session (when declared)", receipt.dossierMatch === "NOT_SUPPLIED" ||
      Boolean(dossier && receipt.dossierId === dossier.id && receipt.sessionId === dossier.sessionId)]
  ];
  const listed = Object.freeze(checks.map(([name, match]) => Object.freeze({ name, match: Boolean(match) })));
  return Object.freeze({
    allChecksMatch: listed.every(item => item.match),
    checks: listed,
    label: "BYTE-BOUND SELF-ATTESTED KERNEL REPORT · NO SIGNER AUTHENTICATION · NO TRUTH AUTHORITY"
  });
}
