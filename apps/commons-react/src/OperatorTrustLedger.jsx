import React, { useRef, useState } from "react";
import {
  TRUST_LEDGER_FILENAME, TRUST_LEDGER_MAX_BYTES, TRUST_WARNINGS,
  trustRecords, statusOfTrustKey, addTrustKey, changeTrustKeyStatus,
  exportTrustLedger, importTrustLedger
} from "./operatorTrustLedger.mjs";

/** Local operator notes only. No private key material, no automatic pinning. */
export function OperatorTrustLedger({ ledger, onChange, currentFingerprint }) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("");
  const [replaces, setReplaces] = useState("");
  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState("REVOKE");
  const [decisionChecked, setDecisionChecked] = useState(false);
  const [replaceChecked, setReplaceChecked] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  const revision = useRef(0);
  const records = trustRecords(ledger);
  const active = records.filter(record => record.status === "ACTIVE");
  const previous = records.filter(record => record.status !== "ACTIVE");
  const currentStatus = statusOfTrustKey(ledger, currentFingerprint);

  function mutate(action) {
    try {
      const updated = action();
      onChange(updated);
      setError("");
      setNotice("Local key-history journal updated. No key was automatically trusted, approved, signed or published.");
      return true;
    } catch(e) {
      setError(e instanceof Error ? e.message : "Invalid key-history change.");
      return false;
    }
  }
  function add(event) {
    event.preventDefault();
    if (mutate(() => addTrustKey(ledger, {
      fingerprint:key.trim().toLowerCase(), label, sourceNote:source,
      replaces: replaces || null, independentlyChecked: checked
    }))) {
      setKey(""); setLabel(""); setSource(""); setReplaces(""); setChecked(false);
    }
  }
  function change(event) {
    event.preventDefault();
    if (mutate(() => changeTrustKeyStatus(ledger, {
      fingerprint:selected, action:decision, reason, confirmed:decisionChecked
    }))) {
      setSelected(""); setReason(""); setDecisionChecked(false);
    }
  }
  function download() {
    try {
      const blob = new Blob([exportTrustLedger(ledger)],{type:"application/json;charset=utf-8"});
      const url = URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href=url; element.download=TRUST_LEDGER_FILENAME;
      document.body.appendChild(element);
      element.click(); element.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setNotice("Local history download requested. This unsigned file is not a trust credential.");
      setError("");
    } catch {
      setError("Could not create the local history download.");
    }
  }
  async function load(file) {
    const seq=++revision.current;
    setError(""); setNotice("");
    if (!file) return;
    if (!replaceChecked) {
      setError("Acknowledge the unsigned import warning before replacing this page's key history.");
      if (fileInput.current) fileInput.current.value="";
      return;
    }
    if(file.size===0||file.size>TRUST_LEDGER_MAX_BYTES) {
      setError("History import must be nonempty and at most 64 KiB.");
      return;
    }
    try {
      const text=new TextDecoder("utf-8",{fatal:true}).decode(await file.arrayBuffer());
      const parsed=importTrustLedger(text);
      if(revision.current!==seq)return;
      onChange(parsed);
      setSelected("");setReason("");setDecisionChecked(false);setReplaceChecked(false);
      setNotice("Unsigned history imported into this tab. Trust is NOT restored: independently recheck every key before any fingerprint pin.");
      if(fileInput.current)fileInput.current.value="";
    } catch(e) {
      if(revision.current===seq)setError(e instanceof Error?e.message:"History import failed.");
    }
  }

  return (
    <section className="operator-trust-ledger" id="operator-trust-ledger"
      aria-labelledby="operator-trust-heading">
      <div className="eyebrow">R10 / OPERATOR-HELD KEY CONTINUITY · LOCAL ONLY</div>
      <h3 id="operator-trust-heading">Key History & Revocation Desk</h3>
      <p>Maintain a disposable, portable journal of public-key fingerprints and your own independent-check notes. This journal is <strong>not a certificate authority</strong>. It never proves signer identity and never automatically fills the R9 trusted-key field.</p>
      <p className="trust-ledger-principle">{TRUST_WARNINGS.portability}</p>
      <div className="trust-ledger-current" role="status">
        <strong>Current signature key in this page:</strong>{" "}
        {currentFingerprint ? (
          <><code>{currentFingerprint}</code> · <strong>{currentStatus}</strong></>
        ) : "No signature selected"}
        {currentStatus==="REVOKED"&&<p>{TRUST_WARNINGS.revoked}</p>}
        {currentStatus==="RETIRED"&&<p>{TRUST_WARNINGS.retired}</p>}
        {currentStatus==="UNKNOWN"&&<p>{TRUST_WARNINGS.unknown}</p>}
      </div>

      <div className="trust-ledger-journal" role="region" aria-label="Operator key-history journal">
        <div className="trust-ledger-journal-head">
          <strong>{records.length} tracked public keys · {ledger.events.length} local events</strong>
          <button type="button" onClick={download}>Export unsigned key-history JSON ↓</button>
        </div>
        {records.length===0&&<p>No keys recorded. Add only a fingerprint checked through an independent channel. A public key copied from its own signature does not establish trust.</p>}
        <ol>
          {records.map(record=>(
            <li key={record.fingerprint}>
              <div><strong>{record.label}</strong> <span className={"trust-ledger-state trust-ledger-"+record.status.toLowerCase()}>{record.status}</span></div>
              <code>{record.fingerprint}</code>
              <small>Source note (operator statement): {record.sourceNote}</small>
              {record.replaces&&<small>Replaces previously closed key: <code>{record.replaces}</code></small>}
              {record.finalNote&&<small>Closing note: {record.finalNote}</small>}
            </li>
          ))}
        </ol>
      </div>

      <div className="trust-ledger-forms">
        <form onSubmit={add}>
          <h4>Register a reviewed public key</h4>
          <label htmlFor="trust-ledger-key">Ed25519 SPKI SHA-256 fingerprint</label>
          <input id="trust-ledger-key" maxLength={64} value={key}
            placeholder="64 hex characters, independently acquired"
            onChange={event=>{setKey(event.target.value);setChecked(false);}} />
          <label htmlFor="trust-ledger-label">Human-readable key label</label>
          <input id="trust-ledger-label" maxLength={80} value={label}
            placeholder="e.g. Home workstation signing key" onChange={event=>setLabel(event.target.value)} />
          <label htmlFor="trust-ledger-source">Where did you verify this fingerprint independently?</label>
          <textarea id="trust-ledger-source" rows={2} maxLength={240} value={source}
            placeholder="Record your separate trusted source, not the uploaded signature file"
            onChange={event=>setSource(event.target.value)} />
          <label htmlFor="trust-ledger-replaces">Replaces previously retired/revoked key (optional)</label>
          <select id="trust-ledger-replaces" value={replaces} onChange={event=>setReplaces(event.target.value)}>
            <option value="">Independent new key, no rotation link</option>
            {previous.map(record=><option key={record.fingerprint} value={record.fingerprint}>{record.label} ({record.status})</option>)}
          </select>
          <label className="trust-ledger-confirm">
            <input type="checkbox" checked={checked} onChange={event=>setChecked(event.target.checked)} />
            <span>I independently checked this key fingerprint. Registering it is a local operator statement, not proof of identity, and does not automatically trust signatures.</span>
          </label>
          <button type="submit">Add reviewed key to this local journal</button>
        </form>

        <form onSubmit={change}>
          <h4>Retire or revoke an active key</h4>
          <label htmlFor="trust-ledger-target">Select an active key</label>
          <select id="trust-ledger-target" value={selected} onChange={event=>{setSelected(event.target.value);setDecisionChecked(false);}}>
            <option value="">Choose a local key</option>
            {active.map(record=><option key={record.fingerprint} value={record.fingerprint}>{record.label} · {record.fingerprint.slice(0,12)}…</option>)}
          </select>
          <label htmlFor="trust-ledger-action">Transition</label>
          <select id="trust-ledger-action" value={decision} onChange={event=>{setDecision(event.target.value);setDecisionChecked(false);}}>
            <option value="REVOKE">REVOKE · suspected compromise / do not use</option>
            <option value="RETIRE">RETIRE · planned key rotation / historical only</option>
          </select>
          <label htmlFor="trust-ledger-reason">Operator reason</label>
          <textarea id="trust-ledger-reason" rows={2} maxLength={240} value={reason}
            placeholder="Why are you closing the key?" onChange={event=>setReason(event.target.value)} />
          <label className="trust-ledger-confirm">
            <input type="checkbox" checked={decisionChecked} onChange={event=>setDecisionChecked(event.target.checked)} />
            <span>I understand this closes the selected key for the rest of this local journal. A mathematically valid signature will not restore the pin.</span>
          </label>
          <button type="submit" disabled={!selected||!decisionChecked}>Apply local key status change</button>
        </form>
      </div>

      <div className="trust-ledger-import">
        <h4>Restore an unsigned history from your own files</h4>
        <p>{TRUST_WARNINGS.imported} An older or edited backup can omit revocations; compare your backups outside this page. Import replaces the current in-memory journal and clears the R9 confirmation.</p>
        <label className="trust-ledger-confirm">
          <input type="checkbox" checked={replaceChecked} onChange={event=>setReplaceChecked(event.target.checked)} />
          <span>I understand this is an unauthenticated file and will replace my current in-page history.</span>
        </label>
        <label htmlFor="trust-ledger-import">Import local unsigned key-history JSON</label>
        <input ref={fileInput} id="trust-ledger-import" type="file" accept=".json,application/json"
          onChange={event=>{void load(event.target.files?.[0]);}} />
      </div>
      {error&&<p role="alert" className="trust-ledger-error">{error}</p>}
      {notice&&<p role="status" className="trust-ledger-notice">{notice}</p>}
      <p className="thinktank-return-disclosure">Session only · Refresh/clear discards the journal unless you exported it. No background sync, timestamps, signatures, model calls, permission grants, or proof of key ownership.</p>
    </section>
  );
}
