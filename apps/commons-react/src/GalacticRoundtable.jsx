import React, { useEffect, useRef, useState } from "react";
import { ROUNDTABLE_ROLES } from "./commonsPortalRegistry.mjs";
import { reviewedXiCollaborationDoor } from "./xiCommonsDoor.mjs";
import {
  GALACTIC_MAX_RING, GALACTIC_RING_SIZE, galacticSeats, normalizeGalacticMode,
  clampGalacticRing
} from "./galacticRoundtableModel.mjs";
import "./galactic-roundtable.css";

const MODE_STORAGE_KEY = "commons.roundtable.v2.mode";
function initialMode() {
  try { return normalizeGalacticMode(window.localStorage.getItem(MODE_STORAGE_KEY)); }
  catch { return "commons"; }
}

/** A decorative, locally bundled image; controls live in accessible DOM above it. */
function CouncilArtwork() {
  const root = import.meta.env.BASE_URL;
  const [useFallback, setUseFallback] = useState(false);
  // A missing optional WebP must never blank the room; SVG remains bundled.
  return (
    <picture className="galactic-picture" aria-hidden="true">
      {!useFallback && <source type="image/webp" srcSet={root + "images/galactic-roundtable.webp"} />}
      <img className="galactic-art" src={root + "images/galactic-roundtable.svg"}
        onError={() => setUseFallback(true)}
        alt="" loading="lazy" decoding="async" />
    </picture>
  );
}

/**
 * Owner-governed PRESENTATION layer. The only assigned seats are the existing
 * five deterministic practice roles. No Xi participant, conversation, presence
 * or permission is loaded; the public bridge is just a public external link.
 */
export function GalacticRoundtable({ openedSeats = 0, councilStarted = false, councilClosed = false }) {
  const [mode, setMode] = useState(initialMode);
  const [ring, setRing] = useState(0);
  const [selected, setSelected] = useState(null);
  const rootRef = useRef(null);
  const dialCloseRef = useRef(null);
  const seatRefs = useRef(new Map());
  const seats = galacticSeats(mode, ring, ROUNDTABLE_ROLES);
  const chosen = seats.find(seat => seat.id === selected) ?? null;
  const role = chosen?.roleIndex == null ? null : ROUNDTABLE_ROLES[chosen.roleIndex];
  const heard = Boolean(role && chosen.roleIndex < openedSeats);
  const next = Boolean(role && councilStarted && !councilClosed && chosen.roleIndex === openedSeats);
  const reviewedDoor = reviewedXiCollaborationDoor();

  useEffect(() => {
    try { window.localStorage.setItem(MODE_STORAGE_KEY, mode); }
    catch { /* private or restricted browsing may not persist */ }
  }, [mode]);

  useEffect(() => {
    if (chosen) dialCloseRef.current?.focus();
  }, [selected]); // Focus the newly opened dial, not a hidden inactive control.

  useEffect(() => {
    if (!chosen) return undefined;
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setSelected(null);
        return;
      }
      if (event.target.closest(".galactic-dial") || event.target.closest(".galactic-seat")) return;
      setSelected(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [chosen?.id]);

  function dismissDial(restoreFocus = true) {
    const ref = seatRefs.current.get(selected);
    setSelected(null);
    if (restoreFocus) requestAnimationFrame(() => ref?.focus());
  }
  function changeMode(value) {
    setMode(normalizeGalacticMode(value));
    setRing(0);
    setSelected(null);
  }
  function changeRing(delta) {
    setRing(current => clampGalacticRing(current + delta));
    setSelected(null);
  }
  function showCouncil() {
    setSelected(null);
    const target = document.getElementById("roundtable-agenda");
    target?.scrollIntoView({ behavior: "auto", block: "center" });
    target?.focus({ preventScroll: true });
  }

  return (
    <section ref={rootRef} className="galactic-rt" id="galactic-roundtable"
      aria-labelledby="galactic-title" onKeyDown={event => {
        if (event.key === "Escape" && selected) {
          event.preventDefault();
          event.stopPropagation();
          dismissDial();
        }
      }}>
      <div className="galactic-rt-header">
        <div>
          <span className="galactic-eyebrow">INFINITE COMMONS / LIVING COUNCIL R1</span>
          <h2 id="galactic-title">Many minds. <em>One Commons.</em></h2>
          <p>The Grand Roundtable: twelve stations per ring, each with a holographic command dial. Many tables. No thrones.</p>
        </div>
        <div className="galactic-mode-switch" role="group" aria-label="Roundtable experience">
          <button type="button" aria-pressed={mode === "commons"} onClick={() => changeMode("commons")}>Commons Council</button>
          <button type="button" aria-pressed={mode === "xi"} onClick={() => changeMode("xi")}>Xi Table</button>
        </div>
      </div>

      <div className="galactic-mode-caption" role="status">
        {mode === "commons"
          ? "COMMONS / Local deterministic practice. Five fixture roles, no connected AI."
          : "XI / DISCONNECTED PREVIEW · No authenticated Xi access or verified participant presence."}
      </div>

      <div className="galactic-legend" aria-label="Seat status legend">
        <span><i className="galactic-key galactic-key-role" aria-hidden="true" /> Practice role</span>
        <span><i className="galactic-key galactic-key-open" aria-hidden="true" /> Unassigned</span>
        <span><i className="galactic-key galactic-key-heard" aria-hidden="true" /> Fixture turn heard</span>
      </div>

      <div className="galactic-stage-wrap">
        <div className="galactic-stage" aria-label={"Galactic chamber. Ring " + (ring + 1) + ". Twelve selectable stations."}>
          <CouncilArtwork />
          <div className="galactic-starfield" aria-hidden="true" />
          <div className="galactic-heart" aria-hidden="true"><div className="galactic-heart-inner">⋈</div></div>
          {seats.map(seat => {
            const active = chosen?.id === seat.id;
            const isHeard = mode === "commons" && seat.roleIndex != null && seat.roleIndex < openedSeats;
            return (
              <button type="button" key={seat.id}
                ref={element => {
                  if (element) seatRefs.current.set(seat.id, element);
                  else seatRefs.current.delete(seat.id);
                }}
                className={"galactic-seat" + (active ? " galactic-seat-current" : "") +
                  (seat.roleIndex != null ? " galactic-seat-assigned" : "") +
                  (isHeard ? " galactic-seat-heard" : "")}
                style={{ left: seat.x + "%", top: seat.y + "%" }}
                aria-label={"Seat " + seat.number + ": " + seat.label +
                  (isHeard ? ". Fixture turn heard." : seat.roleIndex != null ? ". Offline practice role." : ". No participant assigned.") +
                  " Open controls"}
                aria-expanded={active}
                aria-controls={active ? "galactic-seat-dial" : undefined}
                title={"Station " + seat.number + " · " + seat.label}
                onClick={() => active ? dismissDial() : setSelected(seat.id)}>
                <span className="galactic-seat-ring" aria-hidden="true" />
                <span className="galactic-seat-num">{String(seat.number).padStart(2, "0")}</span>
                <span className="galactic-seat-name">{seat.roleIndex != null ? seat.label : "OPEN"}</span>
              </button>
            );
          })}
        </div>

        {chosen && (
          <section id="galactic-seat-dial" className="galactic-dial"
            role="region" aria-labelledby="galactic-dial-heading"
            aria-label={"Seat " + chosen.number + " controls"}>
            <button type="button" ref={dialCloseRef}
              className="galactic-dial-close" aria-label="Close seat controls"
              onClick={() => dismissDial()}>×</button>
            <div className="galactic-dial-orbit" aria-hidden="true">
              <span>✦</span><span>◇</span><span>⋈</span><span>✧</span>
            </div>
            <span className="galactic-dial-caption">STATION {String(chosen.number).padStart(2, "0")}</span>
            <h3 id="galactic-dial-heading">{chosen.label}</h3>
            <p className="galactic-dial-type">{role ? "OFFLINE PRACTICE ROLE" : mode === "xi" ? "XI · DISCONNECTED" : "UNASSIGNED STATION"}</p>
            {role ? (
              <>
                <p>{role.subtitle}. Fixed example text, not a connected person or model.</p>
                <p className="galactic-dial-state">{heard ? "Fixture turn heard" : next ? "Next practice turn" : "Awaiting practice turn"}</p>
                <button type="button" className="galactic-dial-action" onClick={showCouncil}>
                  Open existing council controls
                </button>
              </>
            ) : (
              <>
                <p>{mode === "xi" ? "No authenticated Xi participant or authorized message data is connected." :
                  "This chair is available visually; no user, role or agent has been assigned."}</p>
                {mode === "xi" && <a className="galactic-dial-action" target="_blank"
                  rel="noopener noreferrer" href={reviewedDoor.href}>View public Xi bridge ↗</a>}
              </>
            )}
            <p className="galactic-dial-boundary">Other command slices stay inactive until separately authorized.</p>
          </section>
        )}
      </div>

      <div className="galactic-footer">
        <div className="galactic-rings" role="group" aria-label="Roundtable seating rings">
          <button type="button" disabled={ring === 0} onClick={() => changeRing(-1)}
            aria-label="Previous twelve-seat ring">←</button>
          <span>RING {String(ring + 1).padStart(2, "0")} / {String(GALACTIC_MAX_RING + 1).padStart(2, "0")}</span>
          <button type="button" disabled={ring === GALACTIC_MAX_RING} onClick={() => changeRing(1)}
            aria-label="Next twelve-seat ring">→</button>
        </div>
        <div className="galactic-status" role="status">
          {mode === "commons" ? (ring === 0 ? "5 OFFLINE ROLES · 7 UNASSIGNED" : "12 UNASSIGNED · 0 LIVE MODELS") : "12 UNASSIGNED · XI NOT CONNECTED"}
          <span aria-hidden="true"> · </span>{GALACTIC_RING_SIZE} VISIBLE STATIONS
        </div>
        {mode === "commons"
          ? <button type="button" className="galactic-return" onClick={showCouncil}>Enter existing council ↘</button>
          : <a className="galactic-return" href={reviewedDoor.sourceUrl} target="_blank"
            rel="noopener noreferrer">Public bridge source ↗</a>}
      </div>
      <p className="galactic-boundary">
        Read-only visual layer. The existing five-seat STATION ceremony, governed handoffs and
        permission boundaries remain unchanged. Xi mode does not prove identity, presence or consent.
      </p>
    </section>
  );
}
