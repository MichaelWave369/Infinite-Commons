import test from "node:test";
import assert from "node:assert/strict";
import { ROUNDTABLE_ROLES, MAX_AGENDA_LENGTH } from "../src/commonsPortalRegistry.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";
import {
  CHAMBER_PROTOCOL, CHAMBER_REVIEW_MAX_LENGTH, COUNCIL_CHAMBERS,
  chamberById, beginChamber, hearChamberSeat, submitChamberReview,
  closeChamber, compareChambers
} from "../src/councilChambers.mjs";

function closeAll(agenda = "Should worlds share one identity?") {
  return COUNCIL_CHAMBERS.map(c => {
    let session = beginChamber(c.id, agenda);
    for (const role of ROUNDTABLE_ROLES) {
      const previous = session;
      session = hearChamberSeat(session);
      assert.equal(session.events.at(-1).seat, role.id);
      assert.equal(previous.events.length + 1, session.events.length);
    }
    session = submitChamberReview(session, "Which dependency remains unproven in " + c.name + "?");
    return closeChamber(session);
  });
}

test("three chamber definitions are deterministic and maintain original five-seat order", () => {
  assert.equal(CHAMBER_PROTOCOL, "commons.nested-chambers.offline-practice.v0.5");
  assert.deepEqual(COUNCIL_CHAMBERS.map(c => c.id), ["inquiry", "forge", "dreamwell"]);
  assert.ok(Object.isFrozen(COUNCIL_CHAMBERS));
  assert.equal(new Set(COUNCIL_CHAMBERS.map(c => c.id)).size, 3);
  for (const room of COUNCIL_CHAMBERS) {
    assert.ok(Object.isFrozen(room) && Object.isFrozen(room.lines));
    assert.equal(room.lines.length, ROUNDTABLE_ROLES.length);
    assert.ok(room.lines.every(line => Object.isFrozen(line)));
    assert.ok(room.lines.every(line => line.source === "AUTHORED_OFFLINE_FIXTURE"));
    assert.equal(chamberById(room.id), room);
  }
  assert.equal(chamberById("constructor"), null);
  assert.equal(chamberById("https://evil.example"), null);
  assert.equal(chamberById(null), null);
});

test("session agenda bounds, sequential seats, and human review are mandatory", () => {
  assert.throws(() => beginChamber("unknown", "test"), /Unknown/);
  for (const agenda of ["", "   ", "x".repeat(MAX_AGENDA_LENGTH + 1), null, { forged: "prompt" }]) {
    assert.throws(() => beginChamber("inquiry", agenda), /agenda/);
  }
  let session = beginChamber("inquiry", "  How do we test?  ");
  assert.equal(session.agenda, "How do we test?");
  assert.equal(session.cursor, 0);
  assert.throws(() => submitChamberReview(session, "A question"), /Five seats/);
  assert.throws(() => closeChamber(session), /five-seat/);
  for (let i = 0; i < ROUNDTABLE_ROLES.length; i++) {
    session = hearChamberSeat(session);
    assert.equal(session.events[i].sequence, i + 1);
    assert.equal(session.events[i].seat, ROUNDTABLE_ROLES[i].id);
    assert.match(session.events[i].boundary, /\w/);
    assert.ok(Object.isFrozen(session) && Object.isFrozen(session.events) && Object.isFrozen(session.events[i]));
  }
  assert.throws(() => hearChamberSeat(session), /All chamber/);
  for (const value of ["", "  ", "x".repeat(CHAMBER_REVIEW_MAX_LENGTH + 1), 123]) {
    assert.throws(() => submitChamberReview(session, value), /Operator question/);
  }
  session = submitChamberReview(session, "  What would falsify this?  ");
  assert.equal(session.operatorReview, "What would falsify this?");
  assert.throws(() => submitChamberReview(session, "another"), /Five seats/);
  session = closeChamber(session);
  assert.equal(session.closed, true);
  assert.equal(session.dossier.turnCount, 5);
  assert.equal(session.dossier.fixtureOnly, true);
  assert.equal(session.dossier.independentEvidence, false);
  assert.equal(session.dossier.humanApprovedAction, false);
  assert.equal(session.dossier.published, false);
  assert.throws(() => hearChamberSeat(session), /Invalid or closed/);
  assert.throws(() => closeChamber(session), /Invalid or closed/);
});

test("nested comparison rejects partial, repeated or differing-agenda dossiers", () => {
  const completed = closeAll();
  assert.throws(() => compareChambers([]), /three/);
  assert.throws(() => compareChambers(completed.slice(0, 2)), /three/);
  assert.throws(() => compareChambers([completed[0], completed[0], completed[2]]), /one shared agenda/);
  const wrongAgenda = closeAll("A different agenda")[1];
  assert.throws(() => compareChambers([completed[0], wrongAgenda, completed[2]]), /one shared agenda/);
  const unfinished = beginChamber("forge", "Should worlds share one identity?");
  assert.throws(() => compareChambers([completed[0], unfinished, completed[2]]), /one shared agenda/);
  const result = compareChambers(completed);
  assert.equal(result.chamberCount, 3);
  assert.equal(result.sources.length, 3);
  assert.ok(Object.isFrozen(result) && Object.isFrozen(result.sources));
  assert.equal(result.fixtureOnly, true);
  assert.equal(result.independentEvidence, false);
  assert.equal(result.permissionGranted, false);
  assert.equal(result.published, false);
  assert.deepEqual(result.sources.map(s => s.chamberId), ["inquiry", "forge", "dreamwell"]);
  assert.ok(result.sources.every(s => s.review.includes("unproven")));
});

test("nested rehearsals do not alter Commons nodes, appearance packs or STATION receipt protocol", () => {
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
  const text = JSON.stringify({ rooms: COUNCIL_CHAMBERS, results: closeAll() });
  assert.doesNotMatch(text, /https?:|api_key|access_token|private_key|bearer /i);
});
