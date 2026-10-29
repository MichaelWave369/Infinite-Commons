import React, { useEffect, useState } from "react";
import { ROUNDTABLE_ROLES } from "./commonsPortalRegistry.mjs";
import { reviewedXiCollaborationDoor } from "./xiCommonsDoor.mjs";
import { galacticSeats, normalizeGalacticMode } from "./galacticRoundtableModel.mjs";
import "./galactic-roundtable.css";

const MAX_RING = 7;
const MODE_STORAGE_KEY = "commons.roundtable.v2.mode";

function initialMode() {
  try { return normalizeGalacticMode(window.localStorage.getItem(MODE_STORAGE_KEY)); }
  catch { return "commons"; }
}

/**
 * View-only layer on top of the existing deterministic Council runtime.
 * This component NEVER reads private Xi conversations, fabricates identities,
 * sends messages, starts inference, or modifies STATION.
 */
export function GalacticRoundtable({ openedSeats = 0, councilStarted = false, councilClosed = false }) {
  const [mode, setMode] = useState(initialMode);
  const [ring, setRing] = useState(0);
  const [selected, setSelected] = useState(null);
  const seats = galacticSeats(mode, ring, ROUNDTABLE_ROLES);
  const chosen = seats.find(seat => seat.id === selected) ?? null;
  const role = chosen?.roleIndex == null ? null : ROUNDTABLE_ROLES[chosen.roleIndex];
  const reviewedDoor = reviewedXiCollaborationDoor();
  const heard = role && chosen.roleIndex < openedSeats;
  const next = role && councilStarted && !councilClosed && chosen.roleIndex === openedSeats;

  useEffect(() => {
    try { window.localStorage.setItem(MODE_STORAGE_KEY, mode); }
    catch { /* nonpersistent browsing is supported */ }
  }, [mode]);

  function changeMode(nextMode) {
    setMode(normalizeGalacticMode(nextMode));
    setRing(0);
    setSelected(null);
  }
  function changeRing(delta) {
    setRing(current => Math.max(0, Math.min(MAX_RING, current + delta)));
    setSelected(null);
  }
  function showCouncil() {
    const target = document.getElementById("roundtable-agenda");
    target?.scrollIntoView({ behavior: "auto", block: "center" });
    target?.focus({ preventScroll: true });
  }

  return (
    <section className="galactic-rt" id="galactic-roundtable" aria-labelledby="galactic-title"
      onKeyDown={event => { if (event.key === "Escape" && selected) setSelected(null); }}>
      <div className="galactic-rt-header">
        <div>
          <span className="galactic-eyebrow">INFINITE COMMONS / GRAND ROUNDTABLE V2</span>
          <h2 id="galactic-title">Many minds. <em>One Commons.</em></h2>
          <p>A sovereign council room with twelve stations per ring. Select a seat to open its holographic control dial. No thrones.</p>
        </div>
        <div className="galactic-mode-switch" role="group" aria-label="Roundtable experience">
          <button type="button" aria-pressed={mode === "commons"} onClick={() => changeMode("commons")}>Commons Council</button>
          <button type="button" aria-pressed={mode === "xi"} onClick={() => changeMode("xi")}>Xi Table</button>
        </div>
      </div>

      <div className="galactic-mode-caption" role="status">
        {mode === "commons"
          ? "COMMONS / Five offline practice roles. Additional chairs are unassigned, not live participants."
          : "XI / Visual preview only. No Xi sign-in, live room access, messages, or participant presence connected."}
      </div>

      <div className="galactic-stage-wrap">
        <div className="galactic-stage" aria-label={"Galactic council chamber, ring " + (ring + 1) + ", twelve selectable stations"}>
          <img className="galactic-art" src={import.meta.env.BASE_URL + "images/galactic-roundtable.svg"} alt="" aria-hidden="true" />
          <div className="galactic-starfield" aria-hidden="true" />
          <div className="galactic-heart" aria-hidden="true">
            <div className="galactic-heart-inner">⋈</div>
          </div>
          {seats.map(seat => (
            <button type="button" key={seat.id}
              className={"galactic-seat" + (chosen?.id === seat.id ? " galactic-seat-current" : "") +
                (seat.roleIndex != null ? " galactic-seat-assigned" : "") +
                (mode === "commons" && seat.roleIndex != null && seat.roleIndex < openedSeats ? " galactic-seat-heard" : "")}
              style={{ left: seat.x + "%", top: seat.y + "%" }}
              aria-label={"Seat " + seat.number + ": " + seat.label + ". Open controls"}
              aria-expanded={chosen?.id === seat.id}
              aria-controls={chosen?.id === seat.id ? "galactic-seat-dial" : undefined}
              title={"Seat " + seat.number + " · " + seat.label}
              onClick={() => setSelected(chosen?.id === seat.id ? null : seat.id)}>
              <span className="galactic-seat-ring" aria-hidden="true" />
              <span className="galactic-seat-num">{String(seat.number).padStart(2, "0")}</span>
              <span className="galactic-seat-name">{seat.roleIndex != null ? seat.label : "OPEN"}</span>
            </button>
          ))}
          {chosen && (
            <section id="galactic-seat-dial" className="galactic-dial"
              style={{ left: Math.max(24, Math.min(76, chosen.x)) + "%",
                top: (chosen.y < 50 ? 65 : 35) + "%" }}
              aria-label={"Seat " + chosen.number + " control dial"}>
              <button type="button" className="galactic-dial-close" aria-label="Close seat controls"
                onClick={() => setSelected(null)}>×</button>
              <div className="galactic-dial-orbit" aria-hidden="true"><span>✦</span><span>◇</span><span>⋈</span><span>✧</span></div>
              <span className="galactic-dial-caption">STATION {String(chosen.number).padStart(2, "0")}</span>
              <h3>{chosen.label}</h3>
              {role ? (
                <>
                  <p>{role.subtitle} · Deterministic practice role, not a connected AI.</p>
                  <p className="galactic-dial-state">{heard ? "Fixture turn heard" : next ? "Next practice role" : "Awaiting practice turn"}</p>
                  <button type="button" className="galactic-dial-action" onClick={showCouncil}>Open existing council controls</button>
                </>
              ) : (
                <>
                  <p>{mode === "xi" ? "No verified participant or authorized Xi data is connected." : "Reserved visual station. No role or user is assigned."}</p>
                  {mode === "xi" && <a className="galactic-dial-action" target="_blank" rel="noopener noreferrer"
                    href={reviewedDoor.href}>View public Xi bridge ↗</a>}
                </>
              )}
            </section>
          )}
        </div>
      </div>

      <div className="galactic-footer">
        <div className="galactic-rings" role="group" aria-label="Roundtable seating rings">
          <button type="button" disabled={ring === 0} onClick={() => changeRing(-1)} aria-label="Previous twelve-seat ring">←</button>
          <span>RING {String(ring + 1).padStart(2, "0")} / {String(MAX_RING + 1).padStart(2, "0")}</span>
          <button type="button" disabled={ring === MAX_RING} onClick={() => changeRing(1)} aria-label="Next twelve-seat ring">→</button>
        </div>
        <div className="galactic-status">
          {mode === "commons" ? "5 HISTORICAL PRACTICE ROLES · 0 LIVE MODELS" : "0 VERIFIED XI CONNECTIONS"}
          <span aria-hidden="true"> · </span>
          {seats.length} VISIBLE STATIONS
        </div>
        {mode === "commons"
          ? <button type="button" className="galactic-return" onClick={showCouncil}>Enter existing council ↘</button>
          : <a className="galactic-return" href={reviewedDoor.sourceUrl} target="_blank" rel="noopener noreferrer">Bridge source ↗</a>}
      </div>
      <p className="galactic-boundary">This is a presentation layer. The original five-seat STATION ceremony, governance, and local-only fixtures remain independent and unchanged. Xi mode is a disconnected preview, not evidence of permissions or presence.</p>
    </section>
  );
}
