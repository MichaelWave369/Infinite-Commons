import React, { useState } from "react";
import {
  THINKTANK_HANDOFF_VERSION, THINKTANK_CONTRACT_FILENAME, THINKTANK_DIRECTIVE_LIMIT,
  THINKTANK_LOCAL_MODES, THINKTANK_LOCAL_STEPS, THINKTANK_SOURCE_LINKS,
  buildThinkTankLocalContract, formatThinkTankLocalContract
} from "./thinkTankLocalHandoff.mjs";

/**
 * Download a LOCAL INPUT FILE to ThinkTank's separate terminal-only TT-35
 * council runner. No browser-to-provider network calls and no approval issued.
 */
export function ThinkTankLocalHandoff({ suggestedDirective = "" }) {
  const [mode, setMode] = useState("council");
  const [directive, setDirective] = useState("");
  const [model, setModel] = useState("");
  const [seconds, setSeconds] = useState("180");
  const [reviewed, setReviewed] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  let contract = null;
  let contractText = "";
  let validity = "";
  try {
    contract = buildThinkTankLocalContract({
      mode, directive, model, maxSessionSeconds: Number(seconds)
    });
    contractText = formatThinkTankLocalContract(contract);
  } catch (e) {
    validity = e instanceof Error ? e.message : "Invalid contract.";
  }

  function update(setter, value) {
    setter(value);
    setReviewed(false);
    setStatus("");
    setError("");
  }

  function copyAgenda() {
    update(setDirective, typeof suggestedDirective === "string" ? suggestedDirective : "");
  }

  function download() {
    if (!contract || !reviewed) {
      setError("Review a valid contract and explicitly confirm before downloading.");
      return;
    }
    let href = null;
    try {
      const blob = new Blob([contractText], { type: "application/json;charset=utf-8" });
      href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = THINKTANK_CONTRACT_FILENAME;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Browser-safe cleanup; no destination receives the contents.
      const objectUrl = href;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setStatus("Local contract download requested. No inference, network provider invocation, or permission grant occurred.");
      setError("");
    } catch {
      if (href) URL.revokeObjectURL(href);
      setError("Browser could not download the file. Check download permissions; no remote request was sent.");
    }
  }

  return (
    <section className="thinktank-handoff" id="thinktank-local-handoff"
      aria-labelledby="thinktank-handoff-heading">
      <div className="thinktank-handoff-heading">
        <div>
          <div className="eyebrow">THE BRIDGE DESK / TT-35 LOCAL COUNCIL</div>
          <h2 id="thinktank-handoff-heading">From the Commons <em>to ThinkTank.</em></h2>
          <p>Prepare a real, independently runnable ThinkTank council <strong>input file</strong>. This is a human-reviewed, outbound-only handoff, never live execution from a public website.</p>
        </div>
        <span className="thinktank-handoff-stamp">EXPORT ONLY · OFFLINE · NO APPROVAL</span>
      </div>

      <div className="thinktank-handoff-layout">
        <form className="thinktank-handoff-form" onSubmit={event => { event.preventDefault(); download(); }}>
          <div className="eyebrow">OPERATOR-REVIEWED CONTRACT</div>
          <label htmlFor="thinktank-handoff-mode">Governed ThinkTank mode</label>
          <select id="thinktank-handoff-mode" value={mode}
            onChange={event => update(setMode, event.target.value)}>
            {THINKTANK_LOCAL_MODES.map(item => (
              <option key={item.id} value={item.id}>{item.name} · {item.turns} roles</option>
            ))}
          </select>

          <label htmlFor="thinktank-handoff-directive">Operator directive (minimum 5 characters)</label>
          <textarea id="thinktank-handoff-directive" rows={4} maxLength={THINKTANK_DIRECTIVE_LIMIT}
            value={directive} onChange={event => update(setDirective, event.target.value)}
            placeholder="State the question, desired analysis, constraints, and what must remain unverified." />
          <button type="button" className="thinktank-handoff-secondary" onClick={copyAgenda}>
            Copy current practice agenda into directive (review before export)
          </button>

          <label htmlFor="thinktank-handoff-model">Exact installed Ollama model name</label>
          <input id="thinktank-handoff-model" value={model} autoComplete="off"
            onChange={event => update(setModel, event.target.value)}
            placeholder="e.g. gemma3:12b (only if actually installed)" maxLength={90} />
          <p>No discovery or model status check runs here. The ThinkTank CLI verifies availability later. Don't put passwords, private data, or API keys in the directive.</p>

          <label htmlFor="thinktank-handoff-seconds">Local session deadline (30–600 seconds)</label>
          <input type="number" id="thinktank-handoff-seconds"
            value={seconds} min={30} max={600} step={1}
            onChange={event => update(setSeconds, event.target.value)} />

          <div className="thinktank-contract-review">
            <div className="eyebrow">EXACT FILE CONTENTS · NO HIDDEN FIELDS</div>
            {contract ? (
              <pre aria-label="ThinkTank local council JSON preview">{contractText}</pre>
            ) : (
              <p role="status">Contract incomplete: {validity}</p>
            )}
          </div>

          <label className="thinktank-confirmation">
            <input type="checkbox" checked={reviewed}
              disabled={!contract}
              onChange={event => { setReviewed(event.target.checked); setError(""); }} />
            <span>I reviewed the file contents. Downloading does not run an AI model, approve inference, verify evidence, or authorize an external action.</span>
          </label>
          <button type="submit" className="thinktank-handoff-primary" disabled={!contract || !reviewed}>
            Download local ThinkTank council contract ↓
          </button>
          {status && <p className="thinktank-handoff-success" role="status">{status}</p>}
          {error && <p className="thinktank-handoff-error" role="alert">{error}</p>}
        </form>

        <div className="thinktank-handoff-instructions">
          <div className="eyebrow">WHAT HAPPENS AFTER DOWNLOAD</div>
          <h3>The human keeps the ignition key.</h3>
          <p>This JSON is compatible with ThinkTank's reviewed TT-35 terminal contract shape. It is not proof the user's installed version, model, provider bridge or compute budget is ready.</p>
          <ol>
            {THINKTANK_LOCAL_STEPS.map(step => <li key={step}>{step}</li>)}
          </ol>
          <div className="thinktank-handoff-sources">
            <strong>Read the original ThinkTank implementation</strong>
            <a href={THINKTANK_SOURCE_LINKS.repository} target="_blank" rel="noopener noreferrer">ThinkTank repository ↗</a>
            <a href={THINKTANK_SOURCE_LINKS.contract} target="_blank" rel="noopener noreferrer">Exact contract schema ↗</a>
            <a href={THINKTANK_SOURCE_LINKS.runner} target="_blank" rel="noopener noreferrer">Local runner setup & approval ↗</a>
          </div>
          <p className="thinktank-handoff-safety">Source reviewed in TT-35. There is no public council execution API. A CLI-reported file SHA binds operator approval to exact bytes; it does not authenticate the file author or validate model claims. A real execution can be WITHHELD by ThinkTank's governance. This desk never bypasses that result.</p>
        </div>
      </div>
      <p className="thinktank-handoff-boundary">{THINKTANK_HANDOFF_VERSION} · One-way browser download only. No model was contacted, no remote provider fallback, no STATION ritual, no external DONE, and no provenance promotion.</p>
    </section>
  );
}
