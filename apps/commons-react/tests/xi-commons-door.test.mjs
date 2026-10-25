import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PORTALS } from "../src/commonsPortalRegistry.mjs";
import { XI_COLLABORATION_DOOR, reviewedXiCollaborationDoor } from "../src/xiCommonsDoor.mjs";
test("Xi bridge is public source only, not a fifth story world or live operation",()=>{
  const door=reviewedXiCollaborationDoor();
  assert.equal(PORTALS.length,4);
  assert.ok(!PORTALS.some(p=>p.id===door.id));
  assert.equal(door.href,"https://github.com/MichaelWave369/xi-vessel-bridge");
  assert.equal(door.liveXiConnected,false);
  assert.equal(door.authorizationGranted,false);
  assert.equal(door.externalPilot,"BLOCKED");
  assert.equal(door.realTwoHostTest,"NOT_RUN");
  assert.equal(door.requiresUserNavigation,true);
  assert.equal(door.fictionWorld,false);
  assert.equal(door.status,"PUBLIC_SOURCE_ONLY");
  assert.ok(Object.isFrozen(XI_COLLABORATION_DOOR));
});
test("Commons UI links the source with explicit navigation only",()=>{
  const jsx=readFileSync(new URL("../src/CommonsNexus.jsx",import.meta.url),"utf8");
  assert.match(jsx,/className="xi-commons-door"/);
  assert.match(jsx,/href=\{reviewedXiCollaborationDoor\(\)\.href\}/);
  assert.match(jsx,/target="_blank" rel="noopener noreferrer"/);
  assert.match(jsx,/not a fifth fictional world/);
  assert.match(jsx,/TWO HOST TEST NOT RUN/);
  assert.doesNotMatch(jsx,/\bfetch\(reviewedXiCollaborationDoor/);
});
