import test from "node:test";
import assert from "node:assert/strict";
import {
  GALACTIC_RING_SIZE, GALACTIC_MAX_RING, GALACTIC_SEAT_POINTS,\n  GALACTIC_ART_ASPECT_RATIO, clampGalacticRing,
  normalizeGalacticMode, galacticSeats
} from "../src/galacticRoundtableModel.mjs";
import { ROUNDTABLE_ROLES } from "../src/commonsPortalRegistry.mjs";

test("twelve fixed, unique, bounded visual seats exist in each ring", () => {
  assert.equal(GALACTIC_RING_SIZE, 12);
  assert.equal(GALACTIC_SEAT_POINTS.length, 12);
  assert.equal(new Set(GALACTIC_SEAT_POINTS.map(p => p.x + ":" + p.y)).size, 12);
  for (const point of GALACTIC_SEAT_POINTS) {
    assert.ok(point.x >= 0 && point.x <= 100);
    assert.ok(point.y >= 0 && point.y <= 100);
  }
});
test("only the original five deterministic council roles occupy Commons ring 1", () => {
  const seats = galacticSeats("commons", 0, ROUNDTABLE_ROLES);
  assert.equal(seats.length, 12);
  assert.deepEqual(seats.slice(0, 5).map(s => s.label), ROUNDTABLE_ROLES.map(r => r.name));
  assert.equal(seats.filter(s => s.source === "offline-practice-role").length, 5);
  assert.ok(seats.slice(5).every(s => s.source === "unassigned"));
});
test("Xi is wholly unconnected until a separately authorized adapter exists", () => {
  const seats = galacticSeats("xi", 0, ROUNDTABLE_ROLES);
  assert.equal(seats.length, 12);
  assert.ok(seats.every(s => s.source === "unassigned" && s.roleIndex === null));
});
test("next Commons ring adds capacity without inventing participants", () => {
  const seats = galacticSeats("commons", 1, ROUNDTABLE_ROLES);
  assert.equal(seats[0].number, 13);
  assert.equal(seats[11].number, 24);
  assert.ok(seats.every(s => s.source === "unassigned"));
});
test("invalid modes and ring indices fail into bounded local presentation", () => {
  assert.equal(normalizeGalacticMode("mystery"), "commons");
  assert.equal(galacticSeats("unknown", -3, ROUNDTABLE_ROLES)[0].number, 1);
  assert.equal(galacticSeats("commons", Number.POSITIVE_INFINITY, ROUNDTABLE_ROLES)[0].number, 1);
});

test("calibrated image hotspots remain on-canvas and unique in clockwise order", () => {
  assert.equal(GALACTIC_SEAT_POINTS.length, 12);
  assert.ok(Math.abs(GALACTIC_ART_ASPECT_RATIO - (1672 / 941)) < 1e-8);
  for (const point of GALACTIC_SEAT_POINTS) {
    assert.ok(point.x >= 12 && point.x <= 88);
    assert.ok(point.y >= 24 && point.y <= 75);
  }
  const north = GALACTIC_SEAT_POINTS[0];
  const south = GALACTIC_SEAT_POINTS[6];
  assert.ok(north.y < 30 && south.y > 68);
  assert.equal(north.x, south.x);
});
test("ring pagination stays in the documented eight-ring range", () => {
  assert.equal(GALACTIC_MAX_RING, 7);
  assert.equal(clampGalacticRing(999), 7);
  assert.equal(clampGalacticRing(-999), 0);
  assert.equal(clampGalacticRing(NaN), 0);
  assert.equal(galacticSeats("commons", 999, ROUNDTABLE_ROLES)[0].number, 85);
  assert.equal(galacticSeats("commons", 999, ROUNDTABLE_ROLES)[11].number, 96);
});
