import React, { useState } from "react";
import {
  COUNCIL_CHAMBERS, CHAMBER_REVIEW_MAX_LENGTH,
  beginChamber, hearChamberSeat, submitChamberReview,
  closeChamber, compareChambers
} from "./councilChambers.mjs";
import { ROUNDTABLE_DEFAULT_AGENDA, MAX_AGENDA_LENGTH, ROUNDTABLE_ROLES } from "./commonsPortalRegistry.mjs";

/**
 * Three independent, operator-stepped offline rehearsal rooms.
 * Human text stays in this React component only. Nothing is transmitted,
 * stored across refreshes, signed, or passed to any live agent.
 */
export function NestedCouncilChambers() {
  const [agenda, setAgenda] = useState(ROUNDTABLE_DEFAULT_AGENDA);
  const [selectedId, setSelectedId] = useState(COUNCIL_CHAMBERS[0].id);
  const [sessions, setSessions] = useState(null);
  const [reviews, setReviews] = useState({});
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState("");

  const chamber = COUNCIL_CHAMBERS.find(room => room.id === selectedId) ?? COUNCIL_CHAMBERS[0];
  const session = sessions?.[chamber.id] ?? null;
  const closedCount = sessions ? Object.values(sessions).filter(value => value.closed).length : 0;
  const readyForComparison = closedCount === COUNCIL_CHAMBERS.length;

  function convene(event) {
    event.preventDefault();
    try {
      const next = Object.fromEntries(COUNCIL_CHAMBERS.map(room => [room.id, beginChamber(room.id, agenda)]));
      setSessions(next);
      setReviews({});
      setComparison(null);
      setSelectedId(COUNCIL_CHAMBERS[0].id);
      setError("");
    } catch {
      setError("Use a shared agenda between 1 and 180 characters.");
    }
  }

  function hear() {
    try {
      const next = hearChamberSeat(session);
      setSessions(previous => ({ ...previous, [chamber.id]: next }));
      setError("");
    } catch {
      setError("Only an open chamber with remaining seats can continue.");
    }
  }

  function review() {
    try {
      const next = submitChamberReview(session, reviews[chamber.id] ?? "");
      setSessions(previous => ({ ...previous, [chamber.id]: next }));
      setError("");
    } catch {
      setError("After five seats, enter a review question between 1 and 240 characters.");
    }
  }

  function close() {
    try {
      const next = closeChamber(session);
      setSessions(previous => ({ ...previous, [chamber.id]: next }));
      setError("");
    } catch {
      setError("Every chamber requires five fixture turns and your written question before closure.");
    }
  }

  function converge() {
    try {
      setComparison(compareChambers(COUNCIL_CHAMBERS.map(room => sessions?.[room.id])));
      setError("");
    } catch {
      setError("Complete and review all three chambers with the shared agenda first.");
    }
  }

  function reset() {
    setSessions(null);
    setReviews({});
    setComparison(null);
    setError("");
    setSelectedId(COUNCIL_CHAMBERS[0].id);
  }

  return (
    <section className="nested-chambers" id="nested-council-chambers"
      aria-labelledby="nested-chambers-heading">
      <div className="nested-chambers-intro">
        <div>
          <div className="eyebrow">THE INNER HALL / THREE COUNCILS · ONE QUESTION</div>
          <h2 id="nested-chambers-heading">The <em>Nested Council Chambers</em></h2>
          <p>Different disciplines. Equal seats. One operator-held question. Walk through three transparent practice councils, challenge the sample contributions, and compare what each chamber considered.</p>
        </div>
        <div className="nested-chambers-count" aria-live="polite">
          <strong>{closedCount} / 3</strong>
          <small>ROOMS REVIEWED</small>
        </div>
      </div>

      <div className="chamber-doors" role="group" aria-label="Choose a nested council chamber">
        {COUNCIL_CHAMBERS.map(room => (
          <button type="button" key={room.id} className="chamber-door"
            aria-pressed={selectedId === room.id}
            style={{ "--chamber-color": room.color }}
            onClick={() => { setSelectedId(room.id); setError(""); }}>
            <span className="chamber-door-sigil" aria-hidden="true">{room.sigil}</span>
            <span className="chamber-door-text">
              <strong>{room.name}</strong>
              <small>{room.subtitle}</small>
              <small className="chamber-door-status">
                {sessions?.[room.id]?.closed ? "REVIEWED · CLOSED" :
                  sessions?.[room.id] ? sessions[room.id].cursor + " / 5 SEATS" : "AWAITING AGENDA"}
              </small>
            </span>
          </button>
        ))}
      </div>

      <div className="chamber-interior" style={{ "--chamber-color": chamber.color }}>
        <div className="chamber-identity">
          <span className="chamber-insignia" aria-hidden="true">{chamber.sigil}</span>
          <div>
            <div className="eyebrow">OFFLINE PRACTICE · {chamber.subtitle.toUpperCase()}</div>
            <h3>{chamber.name}</h3>
            <p>{chamber.description}</p>
          </div>
        </div>
        <blockquote className="chamber-principle">{chamber.rule}</blockquote>

        {!sessions ? (
          <form className="chamber-agenda" onSubmit={convene}>
            <label htmlFor="nested-common-agenda">One question for all three chambers</label>
            <textarea id="nested-common-agenda" value={agenda} rows={3}
              maxLength={MAX_AGENDA_LENGTH} onChange={event => setAgenda(event.target.value)}
              placeholder="What should the three councils examine?" />
            <button type="submit" className="chamber-primary">Convene three practice chambers →</button>
            <p>These chambers use fifteen fixed authored example statements across three rooms. The text does not change in response to the agenda and cannot establish facts.</p>
          </form>
        ) : (
          <>
            <div className="chamber-shared-agenda">
              <strong>SHARED AGENDA</strong>
              <p>{session.agenda}</p>
              <span>{session.cursor} / {ROUNDTABLE_ROLES.length} FIXTURE SEATS HEARD</span>
            </div>
            <div className="chamber-steps" role="list" aria-label={chamber.name + " five council seats"}>
              {ROUNDTABLE_ROLES.map((role, index) => (
                <div className={"chamber-step" + (index < session.cursor ? " chamber-step-heard" : "")}
                  role="listitem" key={role.id}>
                  <span>{index + 1}</span>
                  <strong>{role.name}</strong>
                  <small>{index < session.cursor ? "HEARD" : "WAITING"}</small>
                </div>
              ))}
            </div>
            <div className="chamber-transcript" role="log"
              aria-label={chamber.name + " offline council transcript"}>
              {session.events.length === 0 && (
                <p className="chamber-empty">No seats have spoken. Begin the authored five-seat rehearsal.</p>
              )}
              {session.events.map(entry => (
                <article key={entry.sequence} className="chamber-entry">
                  <div className="chamber-entry-head">
                    <strong>{entry.label}</strong>
                    <span>{entry.kind} · OFFLINE FIXTURE</span>
                  </div>
                  <p>{entry.statement}</p>
                  <div className="chamber-evidence"><strong>Evidence boundary:</strong> {entry.boundary}</div>
                </article>
              ))}
            </div>

            {session.cursor < ROUNDTABLE_ROLES.length && (
              <button type="button" className="chamber-primary" onClick={hear}>
                Hear next {chamber.name} seat →
              </button>
            )}

            {session.cursor === ROUNDTABLE_ROLES.length && !session.operatorReview && (
              <div className="chamber-review">
                <label htmlFor="chamber-human-question">{chamber.question}</label>
                <textarea id="chamber-human-question" value={reviews[chamber.id] ?? ""}
                  rows={3} maxLength={CHAMBER_REVIEW_MAX_LENGTH}
                  onChange={event => setReviews(current => ({ ...current, [chamber.id]: event.target.value }))}
                  placeholder="Enter your own challenge or unresolved question…" />
                <button type="button" className="chamber-primary" onClick={review}>
                  Submit operator review question
                </button>
                <p>Text is your question, not a verified finding. It stays inside this tab.</p>
              </div>
            )}

            {session.operatorReview && (
              <div className="chamber-review-record">
                <strong>OPERATOR QUESTION · NOT INDEPENDENTLY VERIFIED</strong>
                <p>{session.operatorReview}</p>
              </div>
            )}

            {session.operatorReview && !session.closed && (
              <button type="button" className="chamber-primary" onClick={close}>
                Close {chamber.name} practice session
              </button>
            )}
            {session.closed && (
              <div className="chamber-closed" role="status">
                <strong>CHAMBER REVIEWED · LOCAL PRACTICE DOSSIER</strong>
                <code>{session.dossier.format}</code>
                <p>Five authored fixtures heard and one operator question recorded. No live agents, independent verification, consent grants, or publication.</p>
              </div>
            )}
          </>
        )}
      </div>

      {sessions && (
        <div className="chamber-convergence">
          <div>
            <div className="eyebrow">CONVERGENCE DESK / PRACTICE COMPARISON</div>
            <h3>Three councils. No crowned answer.</h3>
            <p>Compare the different chamber rules and human questions. Similar language across scripted fixtures is not real consensus.</p>
          </div>
          <button type="button" className="chamber-compare" disabled={!readyForComparison}
            onClick={converge}>Compare the three chambers →</button>
          <button type="button" className="chamber-reset" onClick={reset}>Discard all local chamber sessions</button>
        </div>
      )}

      {comparison && (
        <section className="chamber-comparison" role="region"
          aria-label="Three chamber practice comparison">
          <h3>Practice comparison · {comparison.chamberCount} completed chambers</h3>
          <p><strong>Shared agenda:</strong> {comparison.agenda}</p>
          <div className="chamber-comparison-grid">
            {comparison.sources.map(item => (
              <article key={item.chamberId}>
                <h4>{COUNCIL_CHAMBERS.find(room => room.id === item.chamberId)?.name}</h4>
                <strong>Discipline rule</strong>
                <p>{item.rule}</p>
                <strong>Unresolved operator question</strong>
                <p>{item.review}</p>
              </article>
            ))}
          </div>
          <p className="chamber-comparison-warning">SCRIPTED COMPARISON ONLY · NO LIVE AI · NO EVIDENCE VERIFIED · NO AUTHORIZATION · NOT STATION</p>
        </section>
      )}
      {error && <p className="chamber-error" role="alert">{error}</p>}
      <p className="chamber-footnote">
        Every chamber contribution is original, predetermined fiction or methodology guidance.
        Operator questions are unverified input. This is a disposable in-page practice experience.
        The Grand Roundtable's existing five-seat STATION ceremony above stays independent.
      </p>
    </section>
  );
}
