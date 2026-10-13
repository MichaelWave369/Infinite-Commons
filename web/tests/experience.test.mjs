import test from "node:test";
import assert from "node:assert/strict";
import {
  PACKS, WORLD_NODES, WORLD_FINGERPRINT, PALETTE_KEYS,
  resolvePack, styleVariables, validatePack
} from "../packs.mjs";
import { ARRIVAL_ID, cityLights, sceneSnapshot } from "../app.mjs";

test("twenty distinct governed appearance packs", () => {
  assert.equal(PACKS.length, 20);
  assert.equal(new Set(PACKS.map((pack) => pack.id)).size, 20);
  assert.ok(PACKS.every(validatePack));
  assert.equal(PACKS.filter((pack) => pack.featured).length, 2);
  assert.equal(resolvePack("unknown").id, "midnight-sierra");
});

test("packs cannot smuggle executable CSS, scripts or authority fields", () => {
  const base = structuredClone(PACKS[0]);
  assert.equal(validatePack({ ...base, permission: "admin" }), false);
  assert.equal(validatePack({ ...base, palette: { ...base.palette, wall: "url(https://evil.invalid/)" } }), false);
  assert.equal(validatePack({ ...base, palette: { ...base.palette, code: "#ffffff" } }), false);
  assert.equal(validatePack({ ...base, scene: "http://example.invalid/world.js" }), false);
  assert.equal(validatePack({ ...base, id: "../evil" }), false);
  assert.deepEqual(Object.keys(styleVariables(base)).sort(),
    PALETTE_KEYS.map((key) => "--" + key.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase())).sort());
});

test("all visuals preserve the same world identity and destinations", () => {
  const start = sceneSnapshot("midnight-sierra");
  assert.equal(start.worldId, ARRIVAL_ID);
  assert.equal(start.worldFingerprint, WORLD_FINGERPRINT);
  assert.equal(start.networkConnected, false);
  assert.equal(WORLD_NODES.length, 4);
  for (const pack of PACKS) {
    const state = sceneSnapshot(pack.id);
    assert.equal(state.worldId, start.worldId);
    assert.equal(state.worldFingerprint, start.worldFingerprint);
    assert.deepEqual(state.visibleNodes, start.visibleNodes);
    assert.equal(state.networkConnected, false);
  }
  assert.notEqual(sceneSnapshot("midnight-sierra").scene, sceneSnapshot("cloudgarden").scene);
});

test("city lights are deterministic decoration, not network data", () => {
  assert.deepEqual(cityLights(20, 369), cityLights(20, 369));
  assert.notDeepEqual(cityLights(20, 369), cityLights(20, 370));
  assert.equal(cityLights(650, 369).length, 650);
  for (const light of cityLights(650, 369)) {
    assert.ok(light.x >= 362 && light.x < 1200);
    assert.ok(light.y >= 400 && light.y < 720);
    assert.ok(light.size > 0);
  }
});
