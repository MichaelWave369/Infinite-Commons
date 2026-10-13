import test from "node:test";
import assert from "node:assert/strict";
import { districtPlan, districtBudget } from "../src/livingCityDistrictPlan.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";

test("three inhabited-looking neighborhood layers are bounded, repeatable decorative geometry", () => {
  const plan = districtPlan(369);
  assert.deepEqual(plan, districtPlan(369));
  assert.notDeepEqual(plan, districtPlan(370));
  assert.deepEqual(districtBudget(plan), {
    near: { buildings: 25, lights: 13 },
    middle: { buildings: 23, lights: 12 },
    far: { buildings: 18, lights: 9 }
  });
  assert.ok(Object.values(plan).every(band => band.buildings.length <= 40 && band.lights.length <= 20));
});

test("all district objects have positive, finite transforms and recede by band", () => {
  const plan = districtPlan();
  for (const [key, band] of Object.entries(plan)) {
    for (const item of [...band.buildings, ...band.lights]) {
      assert.ok(["x", "y", "z", "width", "height", "depth"].every(k => Number.isFinite(item[k])), key);
      assert.ok(["width", "height", "depth"].every(k => item[k] > 0), key);
    }
  }
  assert.ok(plan.near.buildings.every(b => b.z <= -23 && b.z >= -40));
  assert.ok(plan.middle.buildings.every(b => b.z <= -43 && b.z >= -68));
  assert.ok(plan.far.buildings.every(b => b.z <= -77 && b.z >= -97));
});

test("districts carry no visitor identities, remote URLs, permissions or real Commons nodes", () => {
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(PACKS.length, 20);
  assert.doesNotMatch(JSON.stringify(districtPlan()), /https?:|localhost|private|token|permission|person|account|space_id/i);
});

test("pure visual data do not depend on random runtime or current date", () => {
  const a = districtPlan(369);
  assert.deepEqual(a, districtPlan(369));
  assert.ok(a.near.buildings[0].x < a.near.buildings.at(-1).x);
});
