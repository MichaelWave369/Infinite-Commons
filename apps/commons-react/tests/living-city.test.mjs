import test from "node:test";
import assert from "node:assert/strict";
import { livingCityBlueprint } from "../src/livingCityBlueprint.mjs";
import { PACKS, WORLD_FINGERPRINT, WORLD_NODES } from "../../../web/packs.mjs";

test("Living City geometry is deterministic and bounded", () => {
  const a = livingCityBlueprint(369, 145);
  const b = livingCityBlueprint(369, 145);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, livingCityBlueprint(370, 145));
  assert.equal(a.buildings.length, 145);
  assert.ok(a.windows.length > 10 && a.windows.length <= 2200);
  assert.ok(a.buildings.every(x => Object.values(x).every(Number.isFinite)));
  assert.ok(a.windows.every(x => x.warm === true || x.warm === false));
});

test("reject dangerous or oversized scene budgets", () => {
  for (const count of [-1, 241, Infinity, 1.1, "100"]) {
    assert.throws(() => livingCityBlueprint(369, count), RangeError);
  }
});

test("3D rendering stays separate from identity, publishing and semantic world locations", () => {
  const { buildings, windows } = livingCityBlueprint();
  const serialized = JSON.stringify({ buildings, windows });
  assert.doesNotMatch(serialized, /localhost|http|porch|private|\/"space_id"/);
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
  assert.equal(PACKS.find(x => x.id === "midnight-sierra")?.scene, "city");
});

test("deterministic 3D geometry may be rebuilt with a smaller load budget", () => {
  const limited = livingCityBlueprint(369, 12);
  assert.equal(limited.buildings.length, 12);
  assert.ok(limited.windows.length <= livingCityBlueprint(369, 145).windows.length);
});
