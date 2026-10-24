/**
 * Commons R11: operator-held, portable SHA-256 history commitments.
 *
 * This is NOT a signed transparency log. A separately retained, genuinely
 * independently acquired checkpoint can detect changed/rolled-back history
 * relative to that checkpoint. An attacker who replaces BOTH reference and
 * history (or offers an earlier authentic checkpoint) can bypass comparison.
 *
 * No account, network access, storage, private key or trust grant is added.
 */
import { inspectTrustLedger, TRUST_LEDGER_SCHEMA } from "./operatorTrustLedger.mjs";

export const TRUST_CHECKPOINT_SCHEMA = "commons.operator-trust-checkpoint.v0.11";
export const TRUST_CHECKPOINT_VERSION = "commons.key-history-checkpoint.local-v0.11";
export const TRUST_CHECKPOINT_FILENAME = "commons-key-history-checkpoint.json";
export const TRUST_CHECKPOINT_MAX_BYTES = 2048;
export const TRUST_CHECKPOINT_DOMAIN = "COMMONS_OPERATOR_TRUST_HISTORY_V11";
const SHA256 = /^[a-f0-9]{64}$/;
const EVENT_FIELDS = Object.freeze(["sequence", "action", "fingerprint", "label", "sourceNote", "replaces"]);
const CHECKPOINT_FIELDS = Object.freeze(["schema", "algorithm", "historySchema", "eventCount", "headSha256", "domain"]);
const text = new TextEncoder();
const sameFields = (object, fields) => object !== null && typeof object === "object" &&
  !Array.isArray(object) && Object.getPrototypeOf(object) === Object.prototype &&
  Object.keys(object).sort().join("|") === [...fields].sort().join("|");

async function digest(bytes, subtle) {
  if (!subtle || typeof subtle.digest !== "function") throw Error("SHA-256 is unavailable in this browser.");
  const hash = await subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Encodes each fully reviewed event using a fixed property order. Import JSON
 * whitespace or member order does not affect the commitment.
 */
export function canonicalTrustEvent(event) {
  if (!sameFields(event, EVENT_FIELDS)) throw Error("Invalid key-history event shape.");
  return JSON.stringify(EVENT_FIELDS.map(key => event[key]));
}

export async function trustHistoryHeads(ledger, subtle = globalThis.crypto?.subtle) {
  const history = inspectTrustLedger(ledger);
  let previous = await digest(text.encode(TRUST_CHECKPOINT_DOMAIN + "\n" + TRUST_LEDGER_SCHEMA + "\nGENESIS"), subtle);
  const heads = [previous];
  for (const event of history.events) {
    previous = await digest(text.encode(TRUST_CHECKPOINT_DOMAIN + "\n" + previous + "\n" + canonicalTrustEvent(event)), subtle);
    heads.push(previous);
  }
  return Object.freeze(heads);
}

export async function createTrustCheckpoint(ledger, subtle = globalThis.crypto?.subtle) {
  const heads = await trustHistoryHeads(ledger, subtle);
  return Object.freeze({
    schema: TRUST_CHECKPOINT_SCHEMA,
    algorithm: "SHA-256",
    historySchema: TRUST_LEDGER_SCHEMA,
    eventCount: heads.length - 1,
    headSha256: heads.at(-1),
    domain: TRUST_CHECKPOINT_DOMAIN
  });
}

export function inspectTrustCheckpoint(candidate) {
  if (!sameFields(candidate, CHECKPOINT_FIELDS) ||
      candidate.schema !== TRUST_CHECKPOINT_SCHEMA ||
      candidate.algorithm !== "SHA-256" ||
      candidate.historySchema !== TRUST_LEDGER_SCHEMA ||
      candidate.domain !== TRUST_CHECKPOINT_DOMAIN ||
      !Number.isInteger(candidate.eventCount) ||
      candidate.eventCount < 0 || candidate.eventCount > 100 ||
      !SHA256.test(candidate.headSha256)) {
    throw Error("Invalid or unsupported key-history checkpoint. This is not a trusted receipt.");
  }
  return Object.freeze({ ...candidate });
}

export function parseTrustCheckpoint(contents) {
  if (typeof contents !== "string" || !contents.trim() ||
      text.encode(contents).byteLength > TRUST_CHECKPOINT_MAX_BYTES)
    throw Error("Checkpoint must be nonempty JSON under 2 KiB.");
  let parsed;
  try { parsed = JSON.parse(contents); }
  catch { throw Error("Malformed checkpoint JSON."); }
  return inspectTrustCheckpoint(parsed);
}

export function exportTrustCheckpoint(checkpoint) {
  return JSON.stringify(inspectTrustCheckpoint(checkpoint), null, 2) + "\n";
}

/**
 * Compare a separately held checkpoint against the operator's local history.
 * Never use this return value to pin a signing key or establish identity.
 */
export async function compareTrustCheckpoint(ledger, reference, subtle = globalThis.crypto?.subtle) {
  const expected = inspectTrustCheckpoint(reference);
  const heads = await trustHistoryHeads(ledger, subtle);
  const currentCount = heads.length - 1;
  const currentHead = heads.at(-1);
  const prefixMatch = currentCount >= expected.eventCount &&
    heads[expected.eventCount] === expected.headSha256;
  let result;
  if (currentCount < expected.eventCount) {
    result = "ROLLBACK_RELATIVE_TO_REFERENCE";
  } else if (!prefixMatch) {
    result = "HISTORY_DIVERGED_FROM_REFERENCE";
  } else if (currentCount === expected.eventCount) {
    result = "EXACT_CHECKPOINT_MATCH";
  } else {
    result = "CHECKPOINT_PREFIX_MATCHES_WITH_NEW_EVENTS";
  }
  return Object.freeze({
    result, prefixMatch, currentCount, referenceCount: expected.eventCount,
    currentHead, referenceHead: expected.headSha256,
    independentlyAuthenticated: false,
    trustAuthorityGranted: false,
    note: "CONDITIONAL HASH COMPARISON ONLY: the separately preserved checkpoint is NOT authenticated by Commons and does not prove the latest history, real-world time, signing key identity or missing later revocations."
  });
}
