import test from "node:test";
import assert from "node:assert/strict";
import { PORTALS } from "../src/commonsPortalRegistry.mjs";
import { portalCourtyardPlan } from "../src/portalCourtyardPlan.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";
import {
  EXPEDITION_VERSION, EXPEDITION_HALL_ID, EXPEDITION_STOPS,
  beginExpedition, expeditionActiveStop, expeditionActivePortalId,
  inspectExpeditionStory, advanceExpedition, finishExpedition
} from "../src/commonsExpedition.mjs";

test("five expedition waypoints are frozen, ordered and exactly mirror four original portals plus Hall", () => {
  assert.equal(EXPEDITION_VERSION, "commons.expedition.practice-v0.4");
  assert.equal(EXPEDITION_STOPS.length, 5);
  assert.deepEqual(EXPEDITION_STOPS.slice(0, 4).map(s => s.id), PORTALS.map(p => p.id));
  assert.deepEqual(EXPEDITION_STOPS.slice(0, 4).map(s => s.id), portalCourtyardPlan().gates.map(g => g.id));
  assert.equal(EXPEDITION_STOPS[4].id, EXPEDITION_HALL_ID);
  assert.equal(EXPEDITION_STOPS[4].kind, "same-page-hall");
  assert.ok(Object.isFrozen(EXPEDITION_STOPS));
  assert.ok(EXPEDITION_STOPS.every(Object.isFrozen));
  assert.ok(EXPEDITION_STOPS.every(s => s.clue && s.reflection && s.flavor));
});

test("an expedition moves forward only after manually inspecting the current exact story", () => {
  let session = beginExpedition();
  assert.equal(session.index, 0);
  assert.equal(expeditionActivePortalId(session), PORTALS[0].id);
  assert.throws(() => advanceExpedition(session), /Inspect/);
  assert.throws(() => inspectExpeditionStory(session, PORTALS[1].id), /current reviewed/);
  assert.throws(() => inspectExpeditionStory(session, "javascript:alert(1)"), /current reviewed/);
  for (let i = 0; i < PORTALS.length; i++) {
    const before = session;
    session = inspectExpeditionStory(session, PORTALS[i].id);
    assert.equal(before.visited.length, i);
    assert.equal(session.visited.length, i + 1);
    assert.ok(Object.isFrozen(session) && Object.isFrozen(session.visited));
    assert.equal(expeditionActivePortalId(session), PORTALS[i].id);
    session = inspectExpeditionStory(session, PORTALS[i].id);
    assert.equal(session.visited.length, i + 1, "revisiting cannot create duplicate stamps");
    session = advanceExpedition(session);
    assert.equal(session.index, i + 1);
  }
  assert.equal(expeditionActiveStop(session).id, EXPEDITION_HALL_ID);
  assert.equal(expeditionActivePortalId(session), null);
  assert.throws(() => advanceExpedition(session), /Inspect/);
  assert.throws(() => inspectExpeditionStory(session, PORTALS[0].id), /current reviewed/);
  session = finishExpedition(session);
  assert.equal(session.finished, true);
  assert.equal(expeditionActiveStop(session), null);
  assert.equal(session.conclusion.destinations, 4);
  assert.equal(session.conclusion.permission_granted, false);
  assert.equal(session.conclusion.published, false);
  assert.equal(session.conclusion.durable, false);
  assert.throws(() => finishExpedition(session), /required/);
  assert.throws(() => advanceExpedition(session), /Inspect/);
});

test("cannot finish out of order, forge a foreign portal, or advance a missing session", () => {
  assert.throws(() => finishExpedition(null), /required/);
  assert.throws(() => advanceExpedition(null), /Inspect/);
  const start = beginExpedition();
  assert.throws(() => finishExpedition(start), /required/);
  assert.equal(expeditionActiveStop({ version: "forged", index: 0, visited: [], finished: false }), null);
  assert.equal(expeditionActiveStop({ version: EXPEDITION_VERSION, index: 9, visited: [], finished: false }), null);
  assert.equal(expeditionActiveStop({ version: EXPEDITION_VERSION, index: "0", visited: [], finished: false }), null);
  assert.equal(expeditionActiveStop({ version: EXPEDITION_VERSION, index: 0, visited: null, finished: false }), null);
});

test("tour content exposes no real travel authorization, remote URL, user ID or durable record", () => {
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(WORLD_NODES.map(node => node.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
  const serialized = JSON.stringify({ plan: EXPEDITION_STOPS, session: beginExpedition() });
  assert.doesNotMatch(serialized, /https?:|localhost|password|private_key|grant_id|access_token|space_id|published/);
});
