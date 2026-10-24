import React, { useEffect, useRef, useState } from "react";
import {
  LOCAL_SIGNED_REPLAY_VERSION, LOCAL_SIGNATURE_MAX_BYTES,
  parseLocalReplaySignature, verifyLocalReplaySignature
} from "./thinkTankSignedReplay.mjs";

/** The signature and human trust pin never leave this React page. */
export function ThinkTankSignatureDesk({ reportSha256, resetSerial=0 }) {
  const [signature,setSignature]=useState(null);
  const [error,setError]=useState("");
  const [fingerprint,setFingerprint]=useState("");
  const [pinConfirmed,setPinConfirmed]=useState(false);
  const [check,setCheck]=useState(null);
  const [checking,setChecking]=useState(false);
  const epoch=useRef(0);
  const input=useRef(null);

  useEffect(()=>{
    let active=true;
    setCheck(null);
    if(signature&&reportSha256){
      setChecking(true);
      verifyLocalReplaySignature(signature,reportSha256,fingerprint,pinConfirmed)
        .then(result=>{if(active){setCheck(result);setError("");}})
        .catch(err=>{if(active){setError(err instanceof Error?err.message:"Signature verification failed.");}})
        .finally(()=>{if(active)setChecking(false);});
    } else setChecking(false);
    return ()=>{active=false};
  },[signature,reportSha256,fingerprint,pinConfirmed]);

  useEffect(()=>{
    epoch.current+=1;
    setSignature(null);setError("");setFingerprint("");setPinConfirmed(false);setCheck(null);
    if(input.current)input.current.value="";
  },[resetSerial]);

  async function load(file){
    const n=++epoch.current;
    setSignature(null);setCheck(null);setError("");setPinConfirmed(false);
    if(!file)return;
    if(file.size===0||file.size>LOCAL_SIGNATURE_MAX_BYTES){
      setError("Signature JSON must be below 32 KiB.");return;
    }
    try{
      const bytes=await file.arrayBuffer();
      const parsed=parseLocalReplaySignature(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
      if(epoch.current===n)setSignature(parsed);
    }catch(err){if(epoch.current===n)setError(err instanceof Error?err.message:"Invalid local signature.");}
  }

  return (
    <section className="signed-replay-desk" id="thinktank-signature-desk" aria-labelledby="signed-replay-heading">
      <div className="eyebrow">R9 / OPTIONAL ED25519 · HUMAN KEY TRUST</div>
      <h3 id="signed-replay-heading">Who signed the replay report?</h3>
      <p>ThinkTank can separately sign a locally generated R8 replay report with an operator-held Ed25519 key. Load its detached signature here to check the actual cryptography against the <strong>exact original report bytes</strong>. This is not proof of identity or truth.</p>
      <label htmlFor="signed-replay-file">Choose a local ThinkTank detached signature JSON (optional)</label>
      <input ref={input} id="signed-replay-file" type="file" accept=".json,application/json"
        onChange={event=>{void load(event.target.files?.[0]);}} />
      <p>Generate separately using ThinkTank's <code>npm run council:sign -- REPORT_JSON PRIVATE_KEY_PEM OUTPUT_SIGNATURE_JSON --confirm-sign-only</code>. No signing key is uploaded or created in Commons.</p>
      {signature&&(
        <>
          <div className="signed-replay-claim">
            <strong>PUBLIC KEY FINGERPRINT CLAIMED BY SIGNATURE FILE</strong>
            <code>{signature.publicKeyFingerprintSha256}</code>
            <small>Compare against a fingerprint obtained through an independent trusted channel, not copied from this file.</small>
          </div>
          <label htmlFor="signed-replay-pin">Trusted Ed25519 public-key SHA-256 fingerprint, obtained independently</label>
          <input id="signed-replay-pin" type="text" value={fingerprint}
            maxLength={64} autoComplete="off" spellCheck={false}
            placeholder="64 lowercase hexadecimal characters"
            onChange={event=>{setFingerprint(event.target.value);setPinConfirmed(false);}} />
          <label className="signed-replay-trust-confirm">
            <input type="checkbox" checked={pinConfirmed} onChange={event=>setPinConfirmed(event.target.checked)} />
            <span>I independently obtained and checked this public-key fingerprint. I understand this does not verify the signer's real-world identity or evidence claims.</span>
          </label>
        </>
      )}
      {!reportSha256&&signature&&(
        <p role="status">Select the matching R8 replay-verification JSON in the Return Desk first. No signature verdict is possible without its actual file bytes.</p>
      )}
      {checking&&<p role="status">Checking the signature locally…</p>}
      {check&&(
        <div className="signed-replay-results" role="region" aria-label="ThinkTank detached signature cryptographic verification">
          <h4>{check.locallyPinned
            ? "Signature valid · human key fingerprint matched"
            : check.mathematicallyBound
              ? "Signature valid · key trust not independently established"
              : "Signature not fully valid for this report"}</h4>
          <dl>
            <div><dt>Ed25519 signature mathematics</dt><dd>{check.signatureValid?"VALID":"FAIL"}</dd></div>
            <div><dt>Signature's key-fingerprint claim</dt><dd>{check.fingerprintClaimMatches?"MATCH":"MISMATCH"}</dd></div>
            <div><dt>Exact replay report bytes</dt><dd>{check.reportBytesMatch?"MATCH":"MISMATCH"}</dd></div>
            <div><dt>Independently entered key pin</dt><dd>{check.pinnedKeyMatch?"MATCH (USER-ASSERTED)":"NOT CONFIRMED"}</dd></div>
          </dl>
          <p><strong>Calculated public-key SHA-256:</strong> <code>{check.actualKeyFingerprint}</code></p>
          <p className="thinktank-return-warning">{check.status}. Anyone can generate a different key and sign a fabricated report. Even a matching human pin does not independently prove who holds the key, that an AI ran, or that the underlying claims are true.</p>
        </div>
      )}
      {error&&<p role="alert" className="thinktank-return-error">{error}</p>}
      <p className="thinktank-return-disclosure">{LOCAL_SIGNED_REPLAY_VERSION} · Locally verified with browser WebCrypto. Nothing transmitted, no key persisted, no permissions granted, no STATION.</p>
    </section>
  );
}
