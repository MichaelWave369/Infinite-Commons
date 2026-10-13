import test from "node:test";
import assert from "node:assert/strict";
import { architecturalSoulPlan, architecturalSoulBudget } from "../src/architecturalSoulPlan.mjs";
import { livingCityBlueprint } from "../src/livingCityBlueprint.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";

test("v0.6 architecture is repeatable and within bounded instancing budgets", () => {
  const plan = architecturalSoulPlan();
  assert.deepEqual(plan, architecturalSoulPlan(369));
  assert.notDeepEqual(plan, architecturalSoulPlan(370));
  const budget = architecturalSoulBudget(plan);
  assert.ok(budget.facadeFins > 0 && budget.facadeFins <= 34);
  assert.ok(budget.cornices > 0 && budget.cornices <= 17);
  assert.ok(budget.warmBands <= 34);
  assert.ok(budget.balconyRails > 0 && budget.balconyRails <= 42);
  assert.ok(budget.roofPlanters > 0 && budget.roofPlanters <= 12);
  assert.equal(budget.rooftopLeaves, budget.roofPlanters * 3);
  assert.ok(budget.skybridges >= 1 && budget.skybridges <= 3);
  assert.ok(Object.values(budget).every(n => n <= 50));
});

test("details fit existing building elevations and all dimensions are real", () => {
  const source = livingCityBlueprint();
  const plan = architecturalSoulPlan();
  assert.equal(source.buildings.length, 145);
  for (const [kind, parts] of Object.entries(plan)) {
    for (const p of parts) {
      for (const key of ["x", "y", "z"]) assert.ok(Number.isFinite(p[key]), kind);
      if (kind === "skybridges") {
        assert.ok(p.length > 0.25 && p.length < 25);
        assert.ok(Number.isFinite(p.angle));
      } else {
        for (const key of ["width", "height", "depth"]) {
          assert.ok(Number.isFinite(p[key]) && p[key] > 0, kind);
        }
      }
    }
  }
});

test("art budget obeys permitted building count, including empty art", () => {
  const empty = architecturalSoulPlan(369, 0);
  assert.deepEqual(architecturalSoulBudget(empty), {
    facadeFins: 0, cornices: 0, warmBands: 0, balconyRails: 0,
    roofPlanters: 0, rooftopLeaves: 0, skybridges: empty.skybridges.length
  });
  assert.throws(() => architecturalSoulPlan(369, 241), RangeError);
});

test("all new artwork is visual-only and cannot create actual Commons places", () => {
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(WORLD_NODES.map(p => p.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
  assert.doesNotMatch(JSON.stringify(architecturalSoulPlan()), /https?:|localhost|porch|token|permission|private|space_id/i);
});
