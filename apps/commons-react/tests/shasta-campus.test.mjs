import test from "node:test";
import assert from "node:assert/strict";
import {SHASTA_CAMPUS_V01 as campus, shastaCampusBudget} from "../src/shastaCampusPlan.mjs";
import {WORLD_NODES,WORLD_FINGERPRINT,PACKS} from "../../../web/packs.mjs";

test("three distinct Sisters and separate original trinity",()=>{
  assert.deepEqual(campus.sisters.map(x=>x.name),["Three","Six","Nine"]);
  assert.deepEqual(campus.heritage.map(x=>x.id),["parallax-root-temple","trihelion","bloomforge"]);
  assert.deepEqual(campus.sisters.map(x=>x.role),["Signal","Resonance","Fabrication"]);
  assert.match(campus.heritage[1].credit,/Helion/);
  assert.match(campus.heritage[2].credit,/Larrina/);
  assert.equal(campus.heritage[0].canonicalHeightM,90);
  assert.equal(campus.heritage[0].canonicalTerraces,9);
  assert.equal(campus.heritage[1].canonicalSideM,36.9);
  assert.equal(campus.heritage[1].canonicalFloors,9);
  assert.equal(campus.heritage[1].canonicalHeightM,33.21);
});

test("decorative world coordinates are bounded and not claimed as surveyed scale",()=>{
  assert.equal(campus.status,"decorative-proposal");
  assert.equal(campus.renderUnits,"stylized-world-units-not-metres");
  for(const landmark of [...campus.sisters,...campus.heritage]){
    assert.ok(Number.isFinite(landmark.x) && Number.isFinite(landmark.z));
    assert.ok(Number.isFinite(landmark.height) && landmark.height>0);
  }
  assert.deepEqual(shastaCampusBudget(),{sisterPyramids:3,originalHeritageLandmarks:3,namedDistricts:7,canonicalTempleTerraces:9});
  assert.doesNotMatch(JSON.stringify(campus),/https?:|secret|privateKey|password|userId/i);
});
test("visual proposal cannot modify fixed Commons locations or style catalog",()=>{
  assert.equal(WORLD_NODES.map(n=>n.id).join("|"),WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length,4);
  assert.equal(PACKS.length,20);
});
