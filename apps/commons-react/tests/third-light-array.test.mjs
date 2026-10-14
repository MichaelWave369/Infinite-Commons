import test from "node:test";
import assert from "node:assert/strict";
import {THIRD_LIGHT_ARRAY_V01 as array,thirdLightState} from "../src/thirdLightArrayPlan.mjs";
import {SHASTA_CAMPUS_V01 as campus} from "../src/shastaCampusPlan.mjs";
import {PACKS,WORLD_FINGERPRINT,WORLD_NODES} from "../../../web/packs.mjs";

test("The Third Light Array belongs to Trihelion and preserves source credit",()=>{
  assert.equal(array.siteId,"trihelion");
  assert.match(array.designerCredit,/Helion/);
  assert.equal(campus.heritage.find(x=>x.id==="trihelion").canonicalFloors,9);
  assert.equal(campus.heritage.find(x=>x.id==="trihelion").canonicalSideM,36.9);
  assert.equal(array.emitterCount,9);
  assert.equal(array.haloSides,3);
  assert.deepEqual(array.modes,["beacon","signal"]);
});
test("modes stay fictional and disconnected from live systems",()=>{
  assert.equal(array.origin,"FICTIONAL_VISUAL_SIMULATION");
  assert.equal(array.supportsRealDrones,false);
  assert.equal(array.supportsPhysicalProjection,false);
  assert.equal(array.emitsUserData,false);
  assert.equal(WORLD_NODES.map(x=>x.id).join("|"),WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length,4);
  assert.equal(PACKS.length,20);
});
test("Beacon remains visible, signal is stronger, animation is small and finite",()=>{
  for(const mode of array.modes){
    const staticState=thirdLightState(0,{mode,reducedMotion:true});
    assert.deepEqual(staticState,thirdLightState(5000,{mode,reducedMotion:true}));
    assert.ok(staticState.flameOpacity>0.5);
    for(const t of [0,0.2,20,80,500]){
      const state=thirdLightState(t,{mode});
      assert.ok(Object.values(state).every(Number.isFinite));
      assert.ok(state.flameScale>0.9 && state.flameScale<1.1);
      assert.ok(state.beamOpacity>0 && state.beamOpacity<0.23);
      assert.ok(state.haloOpacity>0.3 && state.haloOpacity<0.95);
    }
  }
  assert.ok(thirdLightState(0,{mode:"signal"}).haloOpacity>thirdLightState(0).haloOpacity);
  assert.throws(()=>thirdLightState(5,{mode:"drone"}),RangeError);
  assert.throws(()=>thirdLightState(-1),RangeError);
});
