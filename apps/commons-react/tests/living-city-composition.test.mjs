import test from "node:test";
import assert from "node:assert/strict";
import { citySilhouettePlan, cityDetailBudget } from "../src/citySilhouettePlan.mjs";
import { livingCityBlueprint } from "../src/livingCityBlueprint.mjs";
import { PACKS, WORLD_NODES, WORLD_FINGERPRINT } from "../../../web/packs.mjs";

test("v0.4 skyline details stay bounded and deterministic", () => {
  const a = citySilhouettePlan(369, 145);
  const b = citySilhouettePlan(369, 145);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, citySilhouettePlan(370, 145));
  assert.deepEqual(cityDetailBudget(a), {
    roofs: 145,
    crowns: 49,
    balconies: a.balconies.length,
    antennae: 14
  });
  assert.ok(a.balconies.length > 0 && a.balconies.length <= 42);
  const full = livingCityBlueprint(369, 145);
  assert.equal(a.roofs.length, full.buildings.length);
});

test("all roof and balcony transforms are finite with strictly positive scales", () => {
  const plan = citySilhouettePlan();
  for (const [kind, pieces] of Object.entries(plan)) {
    assert.ok(pieces.length < 250, kind);
    for (const piece of pieces) {
      assert.ok(["x", "y", "z", "width", "height", "depth"]
        .every(key => Number.isFinite(piece[key])), kind);
      assert.ok(piece.width > 0 && piece.height > 0 && piece.depth > 0, kind);
    }
  }
});

test("art details never alter Commons identities or permissions", () => {
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(PACKS.length, 20);
  assert.equal(PACKS.filter(p => p.featured).length, 2);
  assert.doesNotMatch(JSON.stringify(citySilhouettePlan()), /token|private|https?:|space_id/i);
});

test("empty scene and out-of-budget counts remain safe", () => {
  const empty = citySilhouettePlan(369, 0);
  assert.deepEqual(cityDetailBudget(empty), { roofs: 0, crowns: 0, balconies: 0, antennae: 0 });
  assert.throws(() => citySilhouettePlan(369, 241), RangeError);
});
