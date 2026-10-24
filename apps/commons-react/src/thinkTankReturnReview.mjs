/**
 * Commons R7: Local-only read-only review of ThinkTank TT-35 artifact shapes.
 *
 * Grounded in think-tank/scripts/local-council-entry.ts and
 * think-tank/src/domain/decisionDossier.ts (2026-10-23).
 *
 * IMPORTANT: FNV-1a and ledger/replay flags are NOT independent proof of
 * authenticity, real provider execution, true claims, or valid ledger replay.
 * The original ThinkTank kernel must independently verify events.
 */
export const RETURN_DESK_VERSION = "commons.thinktank-return.format-review-v0.7";
export const LEDGER_SCHEMA = "phi-thinktank-local-council-result.v0.1";
export const DOSSIER_FINGERPRINT = /^fnv1a32:[a-f0-9]{8}$/;
export const RETURN_MAX_BYTES = 2 * 1024 * 1024;
export const RETURN_MAX_EVENTS = 2000;
export const RETURN_MAX_TURNS = 5;
const ROLE_IDS = new Set(["dreamer", "builder", "challenger", "archivist", "vessie"]);
const MODE_BUDGETS = Object.freeze({ council: 5, trio: 3, audit: 2 });

const plain = value => value !== null && typeof value === "object" &&
  !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const record = (value, name) => {
  if (!plain(value)) throw Error(name + " must be a JSON object.");
  return value;
};
const textField = (value, name, max = 2048) => {
  if (typeof value !== "string" || value.length === 0 || value.length > max) {
    throw Error(name + " must be a bounded nonempty string.");
  }
  return value;
};
const booleanField = (value, name) => {
  if (typeof value !== "boolean") throw Error(name + " must be a boolean.");
  return value;
};
const arrayField = (value, name, max) => {
  if (!Array.isArray(value) || value.length > max) throw Error(name + " is not a bounded array.");
  return value;
};

export function parseLocalReturnJson(content) {
  if (typeof content !== "string" || !content.trim() ||
      new TextEncoder().encode(content).byteLength > RETURN_MAX_BYTES)
    throw Error("Choose a nonempty JSON artifact smaller than 2 MiB.");
  try {
    return record(JSON.parse(content), "Artifact root");
  } catch (error) {
    if (error instanceof SyntaxError) throw Error("Invalid JSON. Nothing imported.");
    throw error;
  }
}

/** ThinkTank's stable UTF-16 FNV1a32 checksum, NOT a cryptographic seal. */
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map(key => JSON.stringify(key) + ":" + canonical(value[key])).join(",") + "}";
}
export function dossierChecksum(dossier) {
  record(dossier, "Dossier");
  const basis = Object.fromEntries(Object.entries(dossier).filter(([key]) => key !== "id" && key !== "basisFingerprint"));
  let hash = 0x811c9dc5;
  const serialized = canonical(basis);
  for (let i = 0; i < serialized.length; i++) {
    hash ^= serialized.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return "fnv1a32:" + hash.toString(16).padStart(8, "0");
}

export function reviewLocalLedger(input) {
  const ledger = record(input, "Ledger");
  if (ledger.schema !== LEDGER_SCHEMA) throw Error("Not a ThinkTank TT-35 local ledger.");
  if (!/^[a-f0-9]{64}$/.test(ledger.contractSha256))
    throw Error("Contract SHA-256 is absent or malformed.");
  const summary = record(ledger.summary, "Summary");
  const mode = summary.mode;
  if (!Object.hasOwn(MODE_BUDGETS, mode)) throw Error("Unsupported local council mode.");
  textField(summary.model, "Model label", 90);
  booleanField(summary.completed, "Completed flag");
  booleanField(summary.aborted, "Aborted flag");
  if (!Number.isInteger(summary.turnsInvoked) || summary.turnsInvoked < 0 ||
      summary.turnsInvoked > MODE_BUDGETS[mode]) throw Error("Out-of-budget provider turn count.");
  const authority = record(ledger.authority, "Authority");
  if (authority.provider !== "ollama-local-only" ||
      authority.executionAuthorityGranted !== false ||
      authority.externalDoneAttested !== false ||
      authority.independentEvidenceVerified !== false)
    throw Error("TT-35 local-only / zero-external-authority declarations do not match.");
  const replay = record(ledger.replay, "Replay report");
  booleanField(replay.exact, "Reported replay exact");
  booleanField(replay.valid, "Reported replay valid");
  const events = arrayField(ledger.events, "Event history", RETURN_MAX_EVENTS);
  let lastSeq = 0;
  let sessionId = null;
  const turns = [];
  let decision = null;
  for (const event of events) {
    record(event, "Event");
    if (!Number.isInteger(event.seq) || event.seq <= lastSeq)
      throw Error("Event sequence is not strictly increasing.");
    lastSeq = event.seq;
    const session = textField(event.sessionId, "Event session ID", 180);
    if (sessionId !== null && session !== sessionId) throw Error("Mixed event session IDs.");
    sessionId = session;
    textField(event.kind, "Event kind", 120);
    if (!["operator", "system", "simulator", "provider", "tool"].includes(event.source))
      throw Error("Unexpected event provenance/source label.");
    if (event.source === "provider" &&
        (event.kind === "utterance.complete" || event.kind === "challenge.raised")) {
      if (!ROLE_IDS.has(event.roleId) || event.seatId !== "local" ||
          event.providerModel !== summary.model)
        throw Error("Provider turn violates local seat/model/role declarations.");
      turns.push(Object.freeze({
        seq: event.seq,
        role: event.roleId,
        model: event.providerModel,
        kind: event.kind
      }));
    }
    if (event.kind === "synthesis.completed" || event.kind === "synthesis.withheld") {
      decision = event.decisionDossier ?? null;
    }
  }
  if (turns.length > summary.turnsInvoked) throw Error("Transcript turns exceed reported provider invocations.");
  if (summary.completed === true && summary.aborted === true)
    throw Error("Run cannot report both completed and aborted.");
  return Object.freeze({
    kind: "local-ledger",
    schema: ledger.schema,
    contractSha256: ledger.contractSha256,
    mode, model: summary.model,
    completedReported: summary.completed,
    abortedReported: summary.aborted,
    turnsInvokedReported: summary.turnsInvoked,
    replayExactReported: replay.exact,
    replayValidReported: replay.valid,
    eventCount: events.length,
    sessionId,
    providerTurns: Object.freeze(turns),
    embeddedDecision: decision,
    trustLevel: "UNTRUSTED LOCAL FILE · FORMAT CHECK ONLY"
  });
}

const DOSSIER_ARRAY_NAMES = Object.freeze([
  "assignments", "claims", "bindings", "evidence", "excerpts",
  "claimReviews", "argumentReviews", "providerTurns"
]);

export function reviewLocalDossier(input) {
  const envelope = record(input, "Dossier export envelope");
  const dossier = record(envelope.dossier, "Dossier");
  const id = textField(dossier.id, "Dossier ID", 80);
  const sessionId = textField(dossier.sessionId, "Dossier session ID", 180);
  const mode = dossier.mode;
  if (!Object.hasOwn(MODE_BUDGETS, mode)) throw Error("Unsupported local council dossier mode.");
  if (!["live-provider", "simulation-fixture", "governed-system"].includes(dossier.executionSource))
    throw Error("Unsupported execution source label.");
  if (!["completed", "withheld"].includes(dossier.outcome))
    throw Error("Unsupported decision outcome label.");
  if (!["STANDARD", "SPECULATIVE", "DRAFT", "READY", "AUDIT", "WITHHELD"].includes(dossier.outputLabel))
    throw Error("Unsupported output label.");
  if (!Number.isInteger(dossier.decisionSeq) || dossier.decisionSeq <= 0)
    throw Error("Invalid decision sequence.");
  booleanField(dossier.actionAllowed, "Action-allowed declaration");
  if (!DOSSIER_FINGERPRINT.test(dossier.basisFingerprint))
    throw Error("Malformed deterministic dossier basis checksum.");
  for (const name of DOSSIER_ARRAY_NAMES) arrayField(dossier[name], name, RETURN_MAX_EVENTS);
  for (const turn of dossier.providerTurns) {
    record(turn, "Dossier provider turn");
    if (!ROLE_IDS.has(turn.roleId) || turn.seatId !== "local" ||
        !Number.isInteger(turn.seq) || turn.seq <= 0 ||
        typeof turn.providerModel !== "string" || !turn.providerModel)
      throw Error("Dossier contains unsupported provider-turn metadata.");
  }
  const expectedFingerprint = dossierChecksum(dossier);
  const fingerprintMatches = expectedFingerprint === dossier.basisFingerprint;
  const extraSections = Object.keys(envelope).filter(key =>
    key !== "dossier" && key !== "override" && key !== "seals");
  return Object.freeze({
    kind: "local-dossier",
    id, sessionId, mode,
    executionSourceClaimed: dossier.executionSource,
    outcomeClaimed: dossier.outcome,
    labelClaimed: dossier.outputLabel,
    actionAllowedClaimed: dossier.actionAllowed,
    decisionSeq: dossier.decisionSeq,
    basisFingerprint: dossier.basisFingerprint,
    basisChecksumMatches: fingerprintMatches,
    providerTurns: Object.freeze(dossier.providerTurns.map(turn => Object.freeze({
      seq: turn.seq, role: turn.roleId, model: turn.providerModel
    }))),
    counts: Object.freeze(Object.fromEntries(DOSSIER_ARRAY_NAMES.map(name => [name, dossier[name].length]))),
    optionalReceiptSections: extraSections.length + (Array.isArray(envelope.seals) ? 1 : 0),
    hasOverride: envelope.override !== null && envelope.override !== undefined,
    trustLevel: "UNTRUSTED LOCAL FILE · FNV CHECKSUM NOT CRYPTOGRAPHIC PROOF",
    validationWarnings: Object.freeze([
      ...(fingerprintMatches ? [] : ["Dossier basis checksum does not match parsed content. Do not treat this as a consistent export."]),
      ...(dossier.executionSource !== "live-provider" ? ["Dossier does not label its execution as live-provider."] : []),
      ...(dossier.actionAllowed ? ["The file claims actionAllowed=true. Commons does not adopt that authority."] : []),
      ...(envelope.override ? ["An override is present but not independently validated."] : []),
      ...(extraSections.length ? ["Additional receipt sections exist but their signatures, timestamps and provenance are NOT verified here."] : [])
    ])
  });
}

export function compareLocalReturn(ledgerReview, dossierReview) {
  if (!ledgerReview || !dossierReview) return null;
  const checks = [
    Object.freeze({ name: "Same session", match: Boolean(ledgerReview.sessionId && ledgerReview.sessionId === dossierReview.sessionId) }),
    Object.freeze({ name: "Same mode", match: ledgerReview.mode === dossierReview.mode }),
    Object.freeze({ name: "Dossier checksum consistent", match: dossierReview.basisChecksumMatches }),
    Object.freeze({ name: "Embedded decision identity", match: Boolean(ledgerReview.embeddedDecision &&
      ledgerReview.embeddedDecision.id === dossierReview.id &&
      ledgerReview.embeddedDecision.basisFingerprint === dossierReview.basisFingerprint &&
      ledgerReview.embeddedDecision.decisionSeq === dossierReview.decisionSeq) }),
    Object.freeze({ name: "Dossier provider turns found in ledger", match: dossierReview.providerTurns.every(turn =>
      ledgerReview.providerTurns.some(record => record.seq === turn.seq && record.role === turn.role && record.model === turn.model)) })
  ];
  return Object.freeze({
    checks: Object.freeze(checks),
    consistent: checks.every(c => c.match),
    level: "STRUCTURAL CROSS-CHECK ONLY · NOT AUTHENTICITY OR VERIFIED REPLAY"
  });
}
