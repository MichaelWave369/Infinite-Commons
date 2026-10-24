import test from "node:test";
import assert from "node:assert/strict";
import {
  PORTAL_REGISTRY_VERSION, PORTALS, PORTAL_STATUSES, portalById,
  ROUNDTABLE_DEFAULT_AGENDA, ROUNDTABLE_ROLES,
  MAX_AGENDA_LENGTH, beginPracticeCouncil, hearNextSeat, callStation
} from "../src/commonsPortalRegistry.mjs";

test("portal plaza has four original unique non-network story destinations", () => {
  assert.equal(PORTAL_REGISTRY_VERSION, "commons.portal-plaza.public-demo.v0.1");
  assert.deepEqual(PORTALS.map(p => p.name), ["ΞΦWorld", "Nevora", "BLACKOUT", "Mikey & Ori"]);
  assert.equal(new Set(PORTALS.map(p => p.id)).size, 4);
  assert.ok(PORTALS.every(p => p.id.startsWith("commons.portal.")));
  assert.ok(PORTALS.every(p => p.arrival.length === 3));
  assert.ok(PORTALS.every(p => !Object.hasOwn(p, "url") && !Object.hasOwn(p, "permission")));
  assert.equal(portalById(PORTALS[0].id), PORTALS[0]);
  assert.equal(portalById("forged.world"), null);
  assert.equal(PORTAL_STATUSES.external, "NOT CONNECTED");
});

test("portal content and roles are immutable, without in-place authority mutation", () => {
  assert.ok(Object.isFrozen(PORTALS));
  assert.ok(PORTALS.every(p => Object.isFrozen(p) && Object.isFrozen(p.arrival)));
  assert.ok(Object.isFrozen(ROUNDTABLE_ROLES));
  assert.equal(new Set(ROUNDTABLE_ROLES.map(x => x.id)).size, 5);
  assert.throws(() => PORTALS[0].arrival.push("Injected text"), TypeError);
  assert.throws(() => { PORTALS[0].name = "attacker"; }, TypeError);
});

test("council requires explicit bounded user agenda, not a silent default run", () => {
  assert.throws(() => beginPracticeCouncil(""), /Agenda/);
  assert.throws(() => beginPracticeCouncil("  "), /Agenda/);
  assert.throws(() => beginPracticeCouncil("a".repeat(MAX_AGENDA_LENGTH + 1)), /Agenda/);
  assert.throws(() => beginPracticeCouncil(null), /Agenda/);
  const started = beginPracticeCouncil("  Is the portal safe?  ");
  assert.equal(started.agenda, "Is the portal safe?");
  assert.equal(started.cursor, 0);
  assert.equal(started.events.length, 0);
  assert.equal(started.station, false);
  assert.ok(ROUNDTABLE_DEFAULT_AGENDA.length <= MAX_AGENDA_LENGTH);
});

test("STATION is unavailable before all five deterministic role turns", () => {
  let session = beginPracticeCouncil("Council test");
  assert.throws(() => callStation(session), /all five/);
  for (let turn = 0; turn < ROUNDTABLE_ROLES.length; turn += 1) {
    const prev = session;
    session = hearNextSeat(session);
    assert.equal(session.cursor, turn + 1);
    assert.equal(session.events.length, turn + 1);
    assert.equal(session.events[turn].seat, ROUNDTABLE_ROLES[turn].id);
    assert.equal(session.events[turn].source, "deterministic-offline-fixture");
    assert.equal(prev.events.length, turn);
    if (turn < 4) assert.throws(() => callStation(session), /all five/);
  }
  assert.throws(() => hearNextSeat(session), /No additional/);
  const stationed = callStation(session);
  assert.equal(stationed.station, true);
  assert.equal(stationed.receipt.turns, 5);
  assert.equal(stationed.receipt.format, "commons.station.local-ceremony.v0.1");
  assert.equal(stationed.receipt.authorization_granted, false);
  assert.equal(stationed.receipt.remote_agents_connected, false);
  assert.equal(stationed.receipt.published, false);
  assert.throws(() => callStation(stationed), /all five/);
  assert.throws(() => hearNextSeat(stationed), /No additional/);
});

test("STATION local ceremony contains no cryptographic, credential or network claims", () => {
  let session = beginPracticeCouncil("Ledger above ego");
  while (session.cursor < ROUNDTABLE_ROLES.length) session = hearNextSeat(session);
  const ceremony = callStation(session).receipt;
  assert.deepEqual(Object.keys(ceremony).sort(), [
    "agenda", "authorization_granted", "declaration", "event_source",
    "format", "published", "remote_agents_connected", "turns"
  ]);
  assert.match(ceremony.declaration, /NO THRONES/);
  assert.equal(ceremony.event_source, "deterministic-offline-fixture");
  assert.ok(!JSON.stringify(ceremony).includes("private_key"));
});
