import React, { useRef, useState } from "react";
import {
  RETURN_DESK_VERSION, RETURN_MAX_BYTES, parseLocalReturnJson,
  reviewLocalLedger, reviewLocalDossier, compareLocalReturn
} from "./thinkTankReturnReview.mjs";

/**
 * Read-only two-file review. Only parsed metadata is rendered.
 * NO localStorage, remote requests, iframe, imports to governance, or RUN.
 */
export function ThinkTankReturnDesk() {
  const [ledger, setLedger] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [ledgerError, setLedgerError] = useState("");
  const [dossierError, setDossierError] = useState("");
  const [notice, setNotice] = useState("");
  const fileEpoch = useRef({ ledger: 0, dossier: 0 });
  const ledgerInput = useRef(null);
  const dossierInput = useRef(null);
  const compared = compareLocalReturn(ledger, dossier);

  async function readLocalArtifact(kind, file) {
    fileEpoch.current[kind] += 1;
    const revision = fileEpoch.current[kind];
    const setData = kind === "ledger" ? setLedger : setDossier;
    const setError = kind === "ledger" ? setLedgerError : setDossierError;
    setData(null);
    setError("");
    setNotice("");
    if (!file) return;
    if (file.size === 0 || file.size > RETURN_MAX_BYTES) {
      setError("File must be nonempty and at most 2 MiB. No file was retained.");
      return;
    }
    try {
      const raw = await file.text();
      if (fileEpoch.current[kind] !== revision) return;
      const parsed = parseLocalReturnJson(raw);
      const outcome = kind === "ledger" ? reviewLocalLedger(parsed) : reviewLocalDossier(parsed);
      if (fileEpoch.current[kind] !== revision) return;
      setData(outcome);
      setNotice("Local file structure reviewed. No verification of provider identity, authenticity, or factual claims.");
    } catch (error) {
      if (fileEpoch.current[kind] !== revision) return;
      setData(null);
      setError(error instanceof Error ? error.message : "Unsupported file.");
    }
  }

  function forget() {
    fileEpoch.current.ledger += 1;
    fileEpoch.current.dossier += 1;
    if (ledgerInput.current) ledgerInput.current.value = "";
    if (dossierInput.current) dossierInput.current.value = "";
    setLedger(null);
    setDossier(null);
    setLedgerError("");
    setDossierError("");
    setNotice("Local review cleared from this page. No file data was uploaded.");
  }

  return (
    <section className="thinktank-return" id="thinktank-return-desk"
      aria-labelledby="thinktank-return-heading">
      <div className="thinktank-return-heading">
        <div>
          <div className="eyebrow">THE RETURN DESK / R7 · PRIVATE FILE VIEWER</div>
          <h2 id="thinktank-return-heading">Inspect a <em>ThinkTank return.</em></h2>
          <p>After running the separately approved ThinkTank CLI, you may inspect its local ledger and optional decision dossier here. Commons reads files in your browser. It cannot prove an AI really ran, or that any claims are true.</p>
        </div>
        <span className="thinktank-return-stamp">READ ONLY · NO UPLOADS · ZERO GRANTS</span>
      </div>
      <div className="thinktank-return-files">
        <div className="thinktank-return-file">
          <label htmlFor="thinktank-ledger-upload">Choose a local ThinkTank TT-35 ledger JSON</label>
          <input ref={ledgerInput} id="thinktank-ledger-upload" type="file" accept=".json,application/json"
            onChange={event => { void readLocalArtifact("ledger", event.target.files?.[0]); }} />
          <p>Expected: <code>council-*-ledger.json</code>. Format review only; no replay execution.</p>
          {ledgerError && <p role="alert" className="thinktank-return-error">Ledger rejected: {ledgerError}</p>}
        </div>
        <div className="thinktank-return-file">
          <label htmlFor="thinktank-dossier-upload">Choose the matching decision dossier JSON (optional)</label>
          <input ref={dossierInput} id="thinktank-dossier-upload" type="file" accept=".json,application/json"
            onChange={event => { void readLocalArtifact("dossier", event.target.files?.[0]); }} />
          <p>Expected: <code>council-*-decision-dossier.json</code>. ThinkTank may legitimately produce no dossier.</p>
          {dossierError && <p role="alert" className="thinktank-return-error">Dossier rejected: {dossierError}</p>}
        </div>
      </div>
      <button type="button" className="thinktank-return-clear" onClick={forget}>
        Clear all local review data
      </button>
      {notice && <p className="thinktank-return-notice" role="status">{notice}</p>}
      {ledger && (
        <div className="thinktank-return-result" role="region" aria-label="ThinkTank local ledger review">
          <div className="eyebrow">LEDGER · UNTRUSTED FILE / REPORTED VALUES</div>
          <h3>Local council run summary</h3>
          <dl className="thinktank-return-metadata">
            <div><dt>Mode</dt><dd>{ledger.mode}</dd></div>
            <div><dt>Reported model</dt><dd>{ledger.model}</dd></div>
            <div><dt>Provider requests (claimed)</dt><dd>{ledger.turnsInvokedReported}</dd></div>
            <div><dt>Reported completion</dt><dd>{ledger.completedReported ? "COMPLETED (CLAIMED)" : "NOT COMPLETED"}</dd></div>
            <div><dt>Reported aborted</dt><dd>{ledger.abortedReported ? "YES" : "NO"}</dd></div>
            <div><dt>Replay status in file</dt><dd>{ledger.replayValidReported && ledger.replayExactReported ? "EXACT (SELF-REPORTED)" : "NOT EXACT/VALID (SELF-REPORTED)"}</dd></div>
            <div><dt>Event count</dt><dd>{ledger.eventCount}</dd></div>
            <div><dt>Local provider utterances</dt><dd>{ledger.providerTurns.length}</dd></div>
          </dl>
          <p><strong>Contract digest stated in file:</strong> <code>{ledger.contractSha256}</code></p>
          <p><strong>Session ID:</strong> <code>{ledger.sessionId ?? "NO EVENTS"}</code></p>
          <div className="thinktank-return-roles" aria-label="Local model event labels">
            {ledger.providerTurns.map(turn => (
              <div key={turn.seq} className="thinktank-return-role">
                <strong>{turn.role}</strong>
                <span>{turn.kind} · seq {turn.seq} · {turn.model}</span>
              </div>
            ))}
          </div>
          <p className="thinktank-return-warning">An uploaded JSON can claim a valid replay or successful provider invocation without either occurring. Commons does not execute ThinkTank's independent replay verifier, attest a provider, or validate the original contract's digest.</p>
        </div>
      )}
      {dossier && (
        <div className="thinktank-return-result" role="region" aria-label="ThinkTank local dossier review">
          <div className="eyebrow">DECISION DOSSIER · METADATA ONLY</div>
          <h3>{dossier.id} · {dossier.outcomeClaimed.toUpperCase()} (CLAIMED)</h3>
          <dl className="thinktank-return-metadata">
            <div><dt>Execution source label</dt><dd>{dossier.executionSourceClaimed} (UNVERIFIED)</dd></div>
            <div><dt>Output label</dt><dd>{dossier.labelClaimed} (CLAIMED)</dd></div>
            <div><dt>Mode</dt><dd>{dossier.mode}</dd></div>
            <div><dt>Action permission in file</dt><dd>{dossier.actionAllowedClaimed ? "TRUE IN FILE · NOT GRANTED HERE" : "FALSE IN FILE"}</dd></div>
            <div><dt>Provider turns in dossier</dt><dd>{dossier.providerTurns.length}</dd></div>
            <div><dt>FNV basis checksum</dt><dd>{dossier.basisChecksumMatches ? "CONSISTENT · NON-CRYPTOGRAPHIC" : "MISMATCH · DO NOT TRUST"}</dd></div>
          </dl>
          <p><strong>Basis checksum as written:</strong> <code>{dossier.basisFingerprint}</code></p>
          <div className="thinktank-return-evidence">
            {Object.entries(dossier.counts).map(([key, count]) => (
              <div key={key}><strong>{count}</strong><span>{key}</span></div>
            ))}
          </div>
          <p><strong>Extra receipt sections:</strong> {dossier.optionalReceiptSections}. No signatures, timestamps, proof chains or origin identities verified.</p>
          {dossier.validationWarnings.map(warning => <p className="thinktank-return-warning" key={warning}>{warning}</p>)}
        </div>
      )}
      {compared && (
        <div className="thinktank-return-match" role="region" aria-label="ThinkTank two-file structural comparison">
          <div className="eyebrow">STRUCTURAL COMPARISON · NOT AN AUTHENTICATION</div>
          <h3>{compared.consistent ? "Files appear structurally consistent" : "Files have mismatches to investigate"}</h3>
          <ul>
            {compared.checks.map(check => (
              <li key={check.name}>
                <strong>{check.match ? "PASS · " : "MISMATCH · "}{check.name}</strong>
              </li>
            ))}
          </ul>
          <p>{compared.level}. Neither a successful comparison nor an FNV checksum independently verifies the event ledger, model execution, authority, external evidence or factual claims.</p>
        </div>
      )}
      <p className="thinktank-return-disclosure">{RETURN_DESK_VERSION} · Review state exists only in the current page, is cleared by refresh/reset, and never changes the Commons council, STATION, PhiSpace, World Portal or Wayfinder permissions. Avoid importing sensitive work into a browser environment you don't trust.</p>
    </section>
  );
}
