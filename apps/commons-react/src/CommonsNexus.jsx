import React, { useState } from "react";
import { reviewedXiCollaborationDoor } from "./xiCommonsDoor.mjs";
import { WayfinderDesk } from "./WayfinderDesk.jsx";
import { ExpeditionTrail } from "./ExpeditionTrail.jsx";
import { NestedCouncilChambers } from "./NestedCouncilChambers.jsx";
import { GalacticRoundtable } from "./GalacticRoundtable.jsx";
import {
  PORTALS, PORTAL_STATUSES, portalById, ROUNDTABLE_ROLES,
  ROUNDTABLE_DEFAULT_AGENDA, MAX_AGENDA_LENGTH,
  beginPracticeCouncil, hearNextSeat, callStation
} from "./commonsPortalRegistry.mjs";

/**
 * Portal Plaza and Roundtable are owner-governed UI previews, not new global
 * nodes, remote login surfaces or live AI seats. No auto navigation.
 */
export function CommonsNexus({
  selectedPortalId = null, onPortalPreview, expedition,
  onExpeditionStart, onExpeditionNext, onExpeditionFinish, onExpeditionReset
}) {
  const [agenda, setAgenda] = useState(ROUNDTABLE_DEFAULT_AGENDA);
  const [council, setCouncil] = useState(null);
  const [error, setError] = useState("");

  const selected = portalById(selectedPortalId);
  const readyForStation = council && !council.station && council.cursor === ROUNDTABLE_ROLES.length;
  const openedSeats = council?.cursor ?? 0;

  function beginCouncil(event) {
    event.preventDefault();
    try {
      setCouncil(beginPracticeCouncil(agenda));
      setError("");
    } catch {
      setError("Write a question for the table, up to 180 characters.");
    }
  }

  function advance() {
    try {
      setCouncil(current => hearNextSeat(current));
    } catch {
      setError("The practice council cannot advance.");
    }
  }

  function station() {
    try {
      setCouncil(current => callStation(current));
      setError("");
    } catch {
      setError("Hear all five council seats before calling STATION.");
    }
  }

  return (
    <section className="commons-nexus" aria-labelledby="nexus-heading" id="portal-plaza">
      <div className="nexus-heading">
        <div>
          <div className="eyebrow">THE NEXT THRESHOLD / COMMONS PORTAL PLAZA</div>
          <h2 id="nexus-heading">A thousand worlds. <em>One Commons.</em></h2>
          <p>Every doorway is an invitation, not an assumption of access. Pick a world to discover its original story preview.</p>
        </div>
        <span className="nexus-pill">4 WORLDS · 0 LIVE TRANSFERS</span>
      </div>

      <div className="portal-gallery" aria-label="Original world portals">
        {PORTALS.map(portal => (
          <article key={portal.id} className="portal-card"
            style={{ "--portal-glow": portal.color }}>
            <div className="portal-art" aria-hidden="true">
              <div className="portal-arch"><span>{portal.symbol}</span></div>
              <div className="portal-ground" />
            </div>
            <div className="portal-card-content">
              <span className="portal-status">{PORTAL_STATUSES.story}</span>
              <h3>{portal.name}</h3>
              <div className="portal-subtitle">{portal.subtitle}</div>
              <p>{portal.description}</p>
              <div className="portal-gateway">{portal.gateway}</div>
              <button type="button" className="portal-enter"
                aria-label={"Preview " + portal.name + " original world"}
                onClick={() => onPortalPreview?.(portal.id)}>
                Peek through portal <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <section className="portal-vignette" role="region"
          aria-label={selected.name + " story preview"} aria-live="polite" id="portal-story-window" tabIndex={-1}>
          <div className="portal-vignette-top">
            <div>
              <div className="eyebrow">OFFLINE STORY WINDOW · NOT A LIVE WORLD</div>
              <h3>You glimpse {selected.name}</h3>
            </div>
            <button type="button" className="nexus-quiet-button" onClick={() => onPortalPreview?.(null)}>
              Return to Portal Plaza ↑
            </button>
          </div>
          {selected.arrival.map((line, index) => (
            <p className="vignette-line" key={index}>{line}</p>
          ))}
          <p className="portal-boundary">This is an original in-page vignette. No account, external origin, private Porch or agent was opened.</p>
        </section>
      )}

      <section className="xi-commons-door" aria-labelledby="xi-commons-heading">
        <div>
          <div className="eyebrow">SOVEREIGN COLLABORATION / VERIFIED PUBLIC WEBSITE</div>
          <h3 id="xi-commons-heading">{reviewedXiCollaborationDoor().title}</h3>
          <p>Our separately governed Xi ⇄ Φ369 bridge has a public roadmap, capability registry,
            local intake workbench and synthetic test packet. The real Xi crossing is not connected.</p>
          <div className="xi-commons-labels">
            <span>R15–R16 · VERIFIED LOCAL FIXTURES</span>
            <span>R17 · EXTERNAL GATES BLOCKED</span>
            <span>R18 · TWO HOST TEST NOT RUN</span>
          </div>
          <p className="xi-commons-fine-print">This is not a fifth fictional world, live Xi protocol portal,
            Xi login, installation route or permission grant. Only the public static website is verified.</p>
        </div>
        <div className="xi-commons-actions">
          <a href={reviewedXiCollaborationDoor().href} target="_blank" rel="noopener noreferrer"
            className="xi-commons-source-link">
            {reviewedXiCollaborationDoor().label} ↗
          </a>
          <a href={reviewedXiCollaborationDoor().sourceUrl} target="_blank" rel="noopener noreferrer"
            className="xi-commons-source-link">Canonical GitHub source ↗</a>
        </div>
      </section>

      <ExpeditionTrail expedition={expedition} onStart={onExpeditionStart}
        onInspect={onPortalPreview} onNext={onExpeditionNext} onFinish={onExpeditionFinish}
        onReset={onExpeditionReset} />

      <WayfinderDesk />

      <GalacticRoundtable openedSeats={openedSeats} councilStarted={Boolean(council)} councilClosed={Boolean(council?.station)} />

      <div className="roundtable-hall" id="roundtable-hall">
        <div className="roundtable-story">
          <div className="eyebrow">THE GRAND HALL / COUNCIL OF COUNCILS</div>
          <h2>The Knights of the <em>Nested Roundtables</em></h2>
          <p>Many minds, many tables, no throne. The Hall is our future home for independently governed councils. For now you can run a transparent, deterministic five-seat rehearsal.</p>
          <div className="roundtable-circle" role="img" aria-label="Five independent council seats arranged around the Commons table">
            <div className="roundtable-ring">
              <div className="roundtable-heart">
                <span className="roundtable-core-symbol">Φ</span>
                <strong>THE TABLE</strong>
                <small>NO THRONES</small>
              </div>
              {ROUNDTABLE_ROLES.map((role, index) => (
                <span key={role.id} className={"roundtable-seat seat-" + index + (index < openedSeats ? " seat-heard" : "")}
                  aria-hidden="true" title={role.name}>{index + 1}</span>
              ))}
            </div>
          </div>
          <div className="roundtable-laws">
            <span>↔ INDEPENDENT SEATS</span>
            <span>◇ HUMAN AUTHORITY</span>
            <span>◎ LEDGER ABOVE EGO</span>
          </div>
        </div>

        <div className="council-console">
          <div className="eyebrow">THE PRACTICE COUNCIL / OFFLINE FIXTURE</div>
          <h3>Convene the Roundtable</h3>
          <p>No live model is contacted. Each named seat speaks a fixed example line, so you can inspect the intended experience before connecting ThinkTank.</p>

          <form onSubmit={beginCouncil} className="council-agenda-form">
            <label htmlFor="roundtable-agenda">The question before the table</label>
            <textarea id="roundtable-agenda" value={agenda} maxLength={MAX_AGENDA_LENGTH}
              rows={3} onChange={event => setAgenda(event.target.value)}
              placeholder="What should the council consider?" />
            <button className="council-action" type="submit">
              {council ? "Start a fresh practice council" : "Convene five seats"}
            </button>
          </form>

          <div className="council-log" role="log" aria-label="Practice council contributions">
            {!council ? (
              <p className="council-empty">The five chairs are ready. Enter an agenda and convene a rehearsal.</p>
            ) : (
              <>
                <div className="council-ledger-head">
                  <strong>AGENDA</strong>
                  <span>{council.agenda}</span>
                  <small>{council.cursor} / {ROUNDTABLE_ROLES.length} FIXTURE TURNS</small>
                </div>
                {council.events.map(event => (
                  <div key={event.sequence} className="council-ledger-line">
                    <span className="council-sequence">{String(event.sequence).padStart(2, "0")}</span>
                    <div>
                      <strong>{event.label}</strong>
                      <small>{ROUNDTABLE_ROLES[event.sequence - 1].subtitle} · OFFLINE FIXTURE</small>
                      <p>{event.message}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {council && !council.station && (
            <div className="council-controls">
              <button type="button" className="council-secondary" disabled={readyForStation} onClick={advance}>
                {readyForStation ? "All five seats heard" : "Hear next council seat →"}
              </button>
              <button type="button" className="station-button" disabled={!readyForStation}
                onClick={station} aria-label="Call STATION and close this local council rehearsal">
                STATION!
              </button>
            </div>
          )}

          {council?.station && (
            <div className="station-ceremony" role="status" aria-live="polite">
              <div className="station-crown" aria-hidden="true">✳</div>
              <strong>STATIONNNNN!!!</strong>
              <p>Five voices heard. The local rehearsal is closed. The ledger remembers the discussion; nobody gets a throne.</p>
              <code>{council.receipt.format}</code>
              <span>LOCAL CEREMONY ONLY · NO NETWORK · NO AUTHORIZATION</span>
            </div>
          )}
          {error && <p className="council-error" role="alert">{error}</p>}
          <p className="council-fine-print">STATION is the ceremonial end of a local council session, not a crypto seal, permission grant, published receipt, or live AI inference. All state resets on refresh.</p>
        </div>
      </div>
      <NestedCouncilChambers />
    </section>
  );
}
