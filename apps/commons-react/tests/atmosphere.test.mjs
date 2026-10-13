import test from "node:test";
import assert from "node:assert/strict";
import { atmospherePlan, atmosphereBudget, SKY_WIDTH, SKY_HEIGHT } from "../src/atmospherePlan.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT } from "../../../web/packs.mjs";

test("midnight sky art is deterministic and bounded", () => {
  const original = atmospherePlan(369);
  assert.deepEqual(original, atmospherePlan(369));
  assert.notDeepEqual(original, atmospherePlan(370));
  assert.equal(original.strokes.length, 650);
  assert.equal(original.bands.length, 22);
  assert.equal(original.distantRidge.length, 16);
  assert.equal(original.foregroundRidge.length, 16);
  const budget = atmosphereBudget(original);
  assert.deepEqual(budget, {
    canvasWidth: SKY_WIDTH,
    canvasHeight: SKY_HEIGHT,
    strokes: 650,
    bands: 22,
    mountainVertices: 32
  });
});

test("brush marks and ridge coordinates remain in the 1K panorama bounds", () => {
  const plan = atmospherePlan();
  assert.ok(plan.strokes.every(p =>
    p.x >= 0 && p.x <= SKY_WIDTH &&
    p.y >= 0 && p.y <= SKY_HEIGHT &&
    p.radius > 0 && p.radius < 2.6 &&
    p.alpha > 0 && p.alpha <= 0.05
  ));
  assert.ok(plan.bands.every(b =>
    b.x >= 0 && b.x <= SKY_WIDTH &&
    b.y >= 90 && b.y <= 350 &&
    b.alpha > 0 && b.alpha <= 0.04
  ));
  for (const ridge of [plan.distantRidge, plan.foregroundRidge]) {
    assert.ok(ridge.every(p =>
      Number.isFinite(p.x) && Number.isFinite(p.y) &&
      p.x >= 0 && p.x <= SKY_WIDTH &&
      p.y >= 310 && p.y <= 415
    ));
  }
});

test("the art recipe contains no identity, network, or semantic authority", () => {
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length, 4);
  assert.doesNotMatch(JSON.stringify(atmospherePlan()), /https?:|127\.0\.0\.1|token|privacy|space_id/i);
});
