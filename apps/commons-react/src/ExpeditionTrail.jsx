import React from "react";
import {
  EXPEDITION_STOPS, EXPEDITION_HALL_ID,
  expeditionActiveStop
} from "./commonsExpedition.mjs";

/** Entirely in-page exploratory fiction; never a world travel credential. */
export function ExpeditionTrail({ expedition, onStart, onInspect, onNext, onFinish, onReset }) {
  const current = expeditionActiveStop(expedition);
  const visited = expedition?.visited ?? [];
  return (
    <section className="expedition-trail" id="commons-expedition" aria-labelledby="expedition-heading">
      <div className="expedition-intro">
        <div>
          <div className="eyebrow">THE EXPLORER'S TRAIL / FIVE THRESHOLDS</div>
          <h2 id="expedition-heading">A journey through <em>the worlds.</em></h2>
          <p>Follow four original story windows and arrive at the Grand Roundtable. Each stop offers a clue drawn from its authored fiction. One visitor, one tab, no accounts, no remote travel.</p>
        </div>
        <div className="expedition-counter" aria-live="polite">
          <strong>{visited.length} / 4</strong>
          <span>STORIES INSPECTED</span>
        </div>
      </div>

      <ol className="expedition-map" aria-label="Five ordered expedition destinations">
        {EXPEDITION_STOPS.map((stop, index) => {
          const done = stop.id === EXPEDITION_HALL_ID
            ? Boolean(expedition?.finished)
            : visited.includes(stop.id);
          const active = Boolean(current?.id === stop.id);
          return (
            <li key={stop.id} className={"expedition-map-stop" + (active ? " is-current" : "") + (done ? " is-visited" : "")}
              style={{ "--expedition-color": stop.color }}>
              <span className="expedition-marker" aria-hidden="true">{done ? "✓" : stop.symbol}</span>
              <div>
                <span className="expedition-stage">{String(index + 1).padStart(2, "0")}</span>
                <strong>{stop.name}</strong>
                <small>{done ? "VISITED" : active ? "CURRENT STOP" : "AWAITING JOURNEY"}</small>
              </div>
            </li>
          );
        })}
      </ol>

      {!expedition ? (
        <div className="expedition-start">
          <div>
            <h3>Begin a Commons Expedition</h3>
            <p>Your journey is temporary. Opening a story window records only a checkmark in this tab, and refreshing the page clears it.</p>
          </div>
          <button type="button" className="expedition-primary" onClick={onStart}>Begin the five-stop expedition →</button>
        </div>
      ) : expedition.finished ? (
        <div className="expedition-finale" role="status" aria-live="polite">
          <span className="expedition-final-symbol" aria-hidden="true">✳</span>
          <div>
            <h3>Expedition complete. The Commons remembers this moment.</h3>
            <p>Four fictional story windows inspected. One Grand Roundtable reached. An ephemeral, local practice summary, not an award, receipt, approval, proof of comprehension, or independent-world visit.</p>
            <code>{expedition.conclusion.format}</code>
          </div>
          <button type="button" className="expedition-reset" onClick={onReset}>Begin a new expedition ↺</button>
        </div>
      ) : current ? (
        <div className="expedition-current" role="region" aria-label="Current expedition waypoint">
          <div className="eyebrow">WAYPOINT {expedition.index + 1} OF {EXPEDITION_STOPS.length}</div>
          <h3>{current.label} · {current.name}</h3>
          <p className="expedition-clue">{current.clue}</p>
          {current.kind === "offline-story-window" ? (
            <>
              <p className="expedition-reflection">Field note: {current.reflection}</p>
              <p className="expedition-flavor">{current.flavor}</p>
              <div className="expedition-buttons">
                <button type="button" className="expedition-primary" onClick={() => onInspect?.(current.id)}>
                  {visited.includes(current.id) ? "Revisit this story window ↗" : "Inspect this story window ↗"}
                </button>
                <button type="button" className="expedition-secondary" disabled={!visited.includes(current.id)}
                  onClick={onNext}>Continue to the next threshold →</button>
                <button type="button" className="expedition-reset" onClick={onReset}>End this expedition</button>
              </div>
              <p className="expedition-disclosure">Viewing the current in-page vignette marks it as inspected. The mark records no reading assessment and sends nothing over the network.</p>
            </>
          ) : (
            <>
              <p className="expedition-reflection">{current.reflection}</p>
              <p className="expedition-flavor">{current.flavor}</p>
              <div className="expedition-buttons">
                <a className="expedition-hall-link" href="#roundtable-hall">Enter the Grand Roundtable Hall ↓</a>
                <button type="button" className="expedition-primary" onClick={onFinish}>Complete this local expedition ✳</button>
                <button type="button" className="expedition-reset" onClick={onReset}>End this expedition</button>
              </div>
              <p className="expedition-disclosure">Completing this tour does not trigger the Roundtable's STATION ceremony. That ceremony still requires all five practice council seats.</p>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
