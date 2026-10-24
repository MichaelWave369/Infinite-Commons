import test from "node:test";
import assert from "node:assert/strict";
import { PORTALS } from "../src/commonsPortalRegistry.mjs";
import {
  PORTAL_COURTYARD_VERSION, PORTAL_COURTYARD_LIMIT,
  portalCourtyardPlan, scenePortalById
} from "../src/portalCourtyardPlan.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";

test("portal courtyard is a stable bounded visual projection of exactly four reviewed story portals", () => {
  const plan = portalCourtyardPlan();
  assert.equal(plan.version, PORTAL_COURTYARD_VERSION);
  assert.equal(plan.gates.length, PORTAL_COURTYARD_LIMIT);
  assert.deepEqual(plan, portalCourtyardPlan());
  assert.deepEqual(plan.gates.map(gate => gate.id), PORTALS.map(portal => portal.id));
  assert.deepEqual(plan.gates.map(gate => gate.color), PORTALS.map(portal => portal.color));
  assert.equal(new Set(plan.gates.map(g => g.x)).size, 4);
  assert.ok(plan.gates.every(g => g.story_only && g.height > 0 && g.width > 0));
  assert.ok(plan.gates.every(g => [g.x, g.y, g.z, g.height, g.width].every(Number.isFinite)));
  assert.ok(Object.isFrozen(plan) && Object.isFrozen(plan.gates));
  assert.ok(plan.gates.every(Object.isFrozen));
  assert.equal(plan.centralTable.function, "decorative-roundtable");
});

test("3D lookup never synthesizes extra world nodes or foreign URLs", () => {
  assert.equal(scenePortalById("commons.portal.xiphiworld")?.name, "ΞΦWorld");
  assert.equal(scenePortalById("commons.portal.blackout")?.name, "BLACKOUT");
  for (const id of [
    "", undefined, "__proto__", "javascript:alert(1)",
    "https://attacker.example", "field-atlas", "commons.portal.false"
  ]) assert.equal(scenePortalById(id), null);
  const data = JSON.stringify(portalCourtyardPlan());
  assert.doesNotMatch(data, /https?:|localhost|password|private_key|grant_id|access_token|user_identity/i);
  assert.equal(portalCourtyardPlan().action, "existing-html-portal-preview-only");
  assert.equal(portalCourtyardPlan().hasRemoteURLs, false);
  assert.equal(portalCourtyardPlan().grantsPermission, false);
});

test("all four canonical Commons world nodes and appearance packs remain invariant", () => {
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(PACKS.length, 20);
});
