import test from "node:test";
import assert from "node:assert/strict";
import {THIRD_LIGHT_CONSTELLATION_V02 as art,constellationBudget} from "../src/constellationArtworkPlan.mjs";
import {THIRD_LIGHT_ARRAY_V01 as array,thirdLightState} from "../src/thirdLightArrayPlan.mjs";
import {WORLD_NODES,WORLD_FINGERPRINT} from "../../../web/packs.mjs";

test("Constellation is clearly authored visual art, not astronomy evidence",()=>{
  assert.equal(art.origin,"FICTIONAL_VISUAL_SIMULATION");
  assert.match(art.label,/Orion-inspired/);
  assert.equal(art.astronomicallyCalibrated,false);
  assert.equal(art.claimsHistoricalAlignment,false);
  assert.equal(art.usesNetworkAssets,false);
  assert.equal(art.controlsRealProjection,false);
  assert.deepEqual(constellationBudget(),{stars:3,segments:2});
  assert.equal(new Set(art.stars.map(s=>s.id)).size,3);
  for(const p of art.stars){
    assert.ok(["x","y","z"].every(key=>Number.isFinite(p[key])));
    assert.ok(Math.max(Math.abs(p.x),Math.abs(p.y),Math.abs(p.z))<50);
  }
  for(const [a,b] of art.links){
    assert.ok(Number.isInteger(a)&&Number.isInteger(b)&&a!==b);
    assert.ok(a>=0&&a<art.stars.length&&b>=0&&b<art.stars.length);
  }
});
test("The original quiet beacon and signal are preserved; constellation is distinct",()=>{
  assert.deepEqual(array.modes,["beacon","signal","constellation"]);
  assert.equal(array.defaultMode,"beacon");
  const quiet=thirdLightState(0,{mode:"beacon"});
  const signal=thirdLightState(0,{mode:"signal"});
  const stars=thirdLightState(0,{mode:"constellation"});
  assert.ok(quiet.beamOpacity<stars.beamOpacity);
  assert.ok(stars.beamOpacity<signal.beamOpacity);
  for(const mode of array.modes){
    assert.deepEqual(thirdLightState(0,{mode,reducedMotion:true}),thirdLightState(100,{mode,reducedMotion:true}));
    assert.ok(Object.values(thirdLightState(24,{mode})).every(Number.isFinite));
  }
});
test("Static sky artwork cannot change Commons semantic identities",()=>{
  assert.equal(WORLD_NODES.length,4);
  assert.equal(WORLD_NODES.map(n=>n.id).join("|"),WORLD_FINGERPRINT);
  assert.doesNotMatch(JSON.stringify(art),/https?:|token|access_key|apiKey/i);
});
