import React, { useEffect, useRef, useState } from "react";
import {
  TRUST_CHECKPOINT_FILENAME, TRUST_CHECKPOINT_SCHEMA, TRUST_CHECKPOINT_DOMAIN,
  createTrustCheckpoint, compareTrustCheckpoint, exportTrustCheckpoint,
  inspectTrustCheckpoint
} from "./trustHistoryCheckpoints.mjs";

/** Comparison never grants trust, signs files, or persists any reference. */
export function TrustHistoryCheckpointDesk({ ledger }) {
  const [latest, setLatest] = useState(null);
  const [referenceCount, setReferenceCount] = useState("");
  const [referenceHash, setReferenceHash] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const revision = useRef(0);

  useEffect(() => {
    revision.current += 1;
    setLatest(null);
    setComparison(null);
    setWorking(false);
    setError("");
  }, [ledger]);

  async function generate() {
    const n = ++revision.current;
    setError("");
    setWorking(true);
    setLatest(null);
    try {
      const output = await createTrustCheckpoint(ledger);
      if (n === revision.current) setLatest(output);
    } catch (e) {
      if (n === revision.current) setError(e instanceof Error ? e.message : "Checkpoint calculation failed.");
    } finally {
      if (n === revision.current) setWorking(false);
    }
  }

  function download() {
    if (!latest) return;
    let url;
    try {
      const bytes = exportTrustCheckpoint(latest);
      url = URL.createObjectURL(new Blob([bytes], {type:"application/json;charset=utf-8"}));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = TRUST_CHECKPOINT_FILENAME;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      const toRevoke = url;
      window.setTimeout(() => URL.revokeObjectURL(toRevoke), 1000);
      setError("");
    } catch {
      if (url) URL.revokeObjectURL(url);
      setError("This browser could not download the checkpoint.");
    }
  }

  async function compare(event) {
    event.preventDefault();
    const n = ++revision.current;
    setError("");
    setComparison(null);
    if (!acknowledged) {
      setError("Confirm you obtained the reference from separate, independently retained storage.");
      return;
    }
    setWorking(true);
    try {
      const checkpoint = inspectTrustCheckpoint({
        schema: TRUST_CHECKPOINT_SCHEMA,
        algorithm: "SHA-256",
        historySchema: ledger.schema,
        eventCount: Number(referenceCount),
        headSha256: referenceHash.trim().toLowerCase(),
        domain: TRUST_CHECKPOINT_DOMAIN
      });
      // Reject blank count: Number("") becomes zero, which is not user intent.
      if (!/^(0|[1-9][0-9]*)$/.test(referenceCount.trim())) throw Error("Enter a whole-number checkpoint event count.");
      const verdict = await compareTrustCheckpoint(ledger, checkpoint);
      if (n === revision.current) setComparison(verdict);
    } catch (e) {
      if (n === revision.current) setError(e instanceof Error ? e.message : "Cannot compare key history.");
    } finally {
      if (n === revision.current) setWorking(false);
    }
  }

  const labels = {
    EXACT_CHECKPOINT_MATCH: "EXACT MATCH TO PROVIDED REFERENCE",
    CHECKPOINT_PREFIX_MATCHES_WITH_NEW_EVENTS: "REFERENCE PREFIX MATCHES · LATER EVENTS PRESENT",
    ROLLBACK_RELATIVE_TO_REFERENCE: "OLDER THAN PROVIDED REFERENCE · POSSIBLE ROLLBACK",
    HISTORY_DIVERGED_FROM_REFERENCE: "REFERENCE HASH MISMATCH · HISTORY DIVERGED"
  };

  return (
    <section className="trust-checkpoint-desk" id="trust-checkpoint-desk"
      aria-labelledby="trust-checkpoint-heading">
      <div className="eyebrow">R11 / PORTABLE HISTORY COMMITMENTS · SHA-256</div>
      <h4 id="trust-checkpoint-heading">The Independent Checkpoint Desk</h4>
      <p>Generate a deterministic SHA-256 fingerprint for your key history, then keep it <strong>somewhere independent</strong> from the history JSON. Later, type that separately retained event count and hash to compare a restored journal. A hash inside its own editable file does not establish trust.</p>

      <div className="trust-checkpoint-columns">
        <div className="trust-checkpoint-panel">
          <h5>1 · Make a new local reference</h5>
          <p>The checkpoint commits to every ordered journal event, including revocations. It is not a signature and no key is auto-approved.</p>
          <button type="button" onClick={generate} disabled={working}>
            Compute current history checkpoint
          </button>
          {latest && (
            <div className="trust-checkpoint-output" role="region" aria-label="Current key-history checkpoint">
              <strong>EVENT COUNT · {latest.eventCount}</strong>
              <code>{latest.headSha256}</code>
              <p>Store this digest and its event count outside this browser and separately from your unsigned journal. Do not trust an arbitrary checkpoint just because it is included in a downloaded file.</p>
              <button type="button" onClick={download}>Download checkpoint JSON ↓</button>
            </div>
          )}
        </div>

        <form className="trust-checkpoint-panel" onSubmit={compare}>
          <h5>2 · Compare against your independently saved reference</h5>
          <label htmlFor="trust-checkpoint-count">Reference event count</label>
          <input id="trust-checkpoint-count" type="number" min={0} max={100} step={1}
            placeholder="e.g. 3" value={referenceCount}
            onChange={event => {setReferenceCount(event.target.value);setAcknowledged(false);setComparison(null);}} />
          <label htmlFor="trust-checkpoint-sha">Reference SHA-256 (64 hex characters)</label>
          <input id="trust-checkpoint-sha" type="text" maxLength={64}
            placeholder="Previously saved independent digest"
            value={referenceHash} spellCheck={false} autoComplete="off"
            onChange={event => {setReferenceHash(event.target.value);setAcknowledged(false);setComparison(null);}} />
          <label className="trust-ledger-confirm">
            <input type="checkbox" checked={acknowledged}
              onChange={event=>setAcknowledged(event.target.checked)}/>
            <span>I obtained this checkpoint from a separately preserved source. I understand a matching older checkpoint does not prove there were no later revocations.</span>
          </label>
          <button type="submit" disabled={working || !acknowledged}>Check history against saved reference</button>
        </form>
      </div>
      {working && <p role="status">Computing SHA-256 locally…</p>}
      {comparison && (
        <div className="trust-checkpoint-result" role="region" aria-label="Independent key-history checkpoint comparison">
          <strong>{labels[comparison.result]}</strong>
          <p>Current events: {comparison.currentCount}. Reference events: {comparison.referenceCount}.</p>
          <p>Current head: <code>{comparison.currentHead}</code></p>
          <p>Reference head: <code>{comparison.referenceHead}</code></p>
          <p><strong>{comparison.prefixMatch ? "Reference-prefix bytes agree" : "Reference is not supported by this history"}</strong></p>
          <p>{comparison.note}</p>
        </div>
      )}
      {error && <p className="trust-ledger-error" role="alert">{error}</p>}
      <p className="trust-checkpoint-limit">
        <strong>Critical limitation:</strong> This detects truncation or changes only relative to the particular checkpoint you independently retained. A forged checkpoint, an obsolete genuine checkpoint, or an attacker replacing both files defeats that protection. Commons cannot certify the newest global history, attest a timestamp, or detect a later revocation unknown to your reference.
      </p>
    </section>
  );
}
