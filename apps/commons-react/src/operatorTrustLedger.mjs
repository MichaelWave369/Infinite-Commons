/**
 * R10: portable human-authored trust KEY HISTORY, never a trust authority.
 * Imported JSON has NO cryptographic authentication and NEVER pins a key.
 * In-memory journal only; exporting/importing is operator-initiated.
 */
export const TRUST_LEDGER_SCHEMA = "commons.operator-trust-key-history.v0.10";
export const TRUST_LEDGER_VERSION = "commons.operator-key-continuity.practice-v0.10";
export const TRUST_LEDGER_FILENAME = "commons-local-key-history.json";
export const TRUST_LEDGER_MAX_BYTES = 64 * 1024;
export const TRUST_LEDGER_MAX_EVENTS = 100;
export const TRUST_SOURCE_MAX = 240;
const HEX = /^[a-f0-9]{64}$/;
const STATES = Object.freeze(["ACTIVE", "RETIRED", "REVOKED"]);
const ACTIONS = Object.freeze(["ADD", "RETIRE", "REVOKE"]);
const FIELDS = Object.freeze(["sequence", "action", "fingerprint", "label", "sourceNote", "replaces"]);
const exact = (obj, keys) => obj && typeof obj === "object" && !Array.isArray(obj) &&
  Object.getPrototypeOf(obj) === Object.prototype &&
  Object.keys(obj).sort().join("|") === [...keys].sort().join("|");
function checkedText(value, name, max) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max ||
      /[\u0000-\u001f\u007f]/.test(value))
    throw Error(name + " must be bounded, nonempty plain text.");
  return value.trim();
}
function checkedFingerprint(value) {
  if (typeof value !== "string" || !HEX.test(value))
    throw Error("Fingerprint must be exactly 64 lowercase SHA-256 hex characters.");
  return value;
}

export function newTrustLedger() {
  return Object.freeze({ schema: TRUST_LEDGER_SCHEMA, events: Object.freeze([]) });
}

/** Reconstructs the entire journal; no reactivation of retired/revoked keys. */
export function inspectTrustLedger(candidate) {
  if (!exact(candidate, ["schema", "events"]) || candidate.schema !== TRUST_LEDGER_SCHEMA ||
      !Array.isArray(candidate.events) || candidate.events.length > TRUST_LEDGER_MAX_EVENTS)
    throw Error("Invalid or oversized operator trust journal.");
  const current = new Map();
  for (let i = 0; i < candidate.events.length; i++) {
    const event = candidate.events[i];
    if (!exact(event, FIELDS) || event.sequence !== i + 1 || !ACTIONS.includes(event.action))
      throw Error("Malformed or out-of-order key-history event.");
    const fingerprint = checkedFingerprint(event.fingerprint);
    const label = checkedText(event.label, "Operator label", 80);
    const sourceNote = checkedText(event.sourceNote, "Operator source note", TRUST_SOURCE_MAX);
    if (event.action === "ADD") {
      if (current.has(fingerprint)) throw Error("Key fingerprints cannot be added twice or reactivated.");
      if (event.replaces !== null) {
        checkedFingerprint(event.replaces);
        if (event.replaces === fingerprint || !["RETIRED", "REVOKED"].includes(current.get(event.replaces)?.status))
          throw Error("Replacement must refer to a previously retired/revoked key.");
      }
      current.set(fingerprint, { fingerprint, label, sourceNote, status: "ACTIVE", replaces: event.replaces });
    } else {
      const prior = current.get(fingerprint);
      if (!prior || prior.status !== "ACTIVE" || event.replaces !== null ||
          label !== prior.label)
        throw Error("Only an active, existing key can be retired or revoked.");
      current.set(fingerprint, { ...prior, status: event.action === "RETIRE" ? "RETIRED" : "REVOKED" });
    }
  }
  return Object.freeze({
    schema: TRUST_LEDGER_SCHEMA,
    events: Object.freeze(candidate.events.map(e => Object.freeze({ ...e })))
  });
}

function append(ledger, event) {
  const base = inspectTrustLedger(ledger);
  if (base.events.length >= TRUST_LEDGER_MAX_EVENTS) throw Error("Local history has reached 100 events; export and start a separate journal.");
  return inspectTrustLedger({ schema: TRUST_LEDGER_SCHEMA,
    events: [...base.events, { sequence: base.events.length + 1, ...event }] });
}

export function trustRecords(ledger) {
  const validated = inspectTrustLedger(ledger);
  const map = new Map();
  for (const event of validated.events) {
    if (event.action === "ADD") {
      map.set(event.fingerprint, Object.freeze({
        fingerprint: event.fingerprint, label: event.label, sourceNote: event.sourceNote,
        replaces: event.replaces, status: "ACTIVE"
      }));
    } else {
      const previous = map.get(event.fingerprint);
      map.set(event.fingerprint, Object.freeze({
        ...previous, status: event.action === "RETIRE" ? "RETIRED" : "REVOKED",
        finalNote: event.sourceNote
      }));
    }
  }
  return Object.freeze([...map.values()]);
}

export function statusOfTrustKey(ledger, fingerprint) {
  if (typeof fingerprint !== "string" || !HEX.test(fingerprint)) return "UNKNOWN";
  return trustRecords(ledger).find(r => r.fingerprint === fingerprint)?.status ?? "UNKNOWN";
}

export function addTrustKey(ledger, { fingerprint, label, sourceNote, replaces = null, independentlyChecked }) {
  if (independentlyChecked !== true) throw Error("Explicit human source verification acknowledgment required.");
  const key = checkedFingerprint(fingerprint);
  return append(ledger, {
    action: "ADD", fingerprint: key, label: checkedText(label, "Operator label", 80),
    sourceNote: checkedText(sourceNote, "Operator source note", TRUST_SOURCE_MAX),
    replaces
  });
}

export function changeTrustKeyStatus(ledger, { fingerprint, action, reason, confirmed }) {
  if (confirmed !== true || !["RETIRE", "REVOKE"].includes(action))
    throw Error("Explicit operator retirement/revocation confirmation required.");
  const current = trustRecords(ledger).find(x => x.fingerprint === fingerprint);
  if (!current) throw Error("Unknown key cannot be modified.");
  return append(ledger, {
    action, fingerprint: current.fingerprint, label: current.label,
    sourceNote: checkedText(reason, "Revocation or retirement reason", TRUST_SOURCE_MAX),
    replaces: null
  });
}

export function exportTrustLedger(ledger) {
  return JSON.stringify(inspectTrustLedger(ledger), null, 2) + "\n";
}
export function importTrustLedger(content) {
  if (typeof content !== "string" || !content.trim() ||
      new TextEncoder().encode(content).byteLength > TRUST_LEDGER_MAX_BYTES)
    throw Error("History JSON must be nonempty and at most 64 KiB.");
  let object;
  try { object = JSON.parse(content); }
  catch { throw Error("Invalid operator key-history JSON."); }
  return inspectTrustLedger(object);
}

export const TRUST_WARNINGS = Object.freeze({
  imported: "Imported key history is operator-controlled text, not verified provenance or trusted signer identity. Recheck each key independently.",
  revoked: "A revoked key is blocked by this local journal even when its Ed25519 signature is mathematically valid.",
  retired: "A retired key is not eligible for a current local trust-pin match. Historical signatures may still be mathematically valid.",
  unknown: "A key not present in the local journal still requires the existing independent fingerprint confirmation.",
  portability: "Exported histories are unsigned, editable files. Missing or altered revocation events cannot be detected without independent backups/witnesses."
});
