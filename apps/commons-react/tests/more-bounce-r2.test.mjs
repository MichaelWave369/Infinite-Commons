import { test } from "node:test";
import assert from "node:assert/strict";
import { BEAT_COUNT, newArcadeRound, nextBeatAt, tapArcade, advanceArcade,
  readXRStick, boundedWalk, nearestDeck } from "../src/moreBounceR2.mjs";
import { JOINT_NAMES, GestureTracker, recognizeGesture } from "../src/vendor/overstrings/gesture.mjs";

test("arcade rhythm challenge accepts exactly one hit per beat", () => {
  let round = newArcadeRound(1000);
  assert.equal(round.status, "running");
  const first = nextBeatAt(round);
  round = tapArcade(round, first);
  assert.equal(round.score, 100);
  assert.equal(round.hits, 1);
  round = tapArcade(round, first + 10);
  assert.equal(round.hits, 1);
  assert.equal(round.last, "Too early");
  for(let i=1;i<BEAT_COUNT;i++) round=tapArcade(round,nextBeatAt(round));
  assert.equal(round.score, 1200);
  assert.equal(round.bestCombo, BEAT_COUNT);
  assert.equal(round.status, "done");
  assert.deepEqual(tapArcade(round, Number.MAX_SAFE_INTEGER), round);
});
test("late ticks count each missed beat, never fake hits", () => {
  const original = newArcadeRound(0);
  assert.strictEqual(advanceArcade(original, 100), original, "no unnecessary XR parent rerender");
  const round = advanceArcade(original, 10000);
  assert.equal(round.misses, BEAT_COUNT);
  assert.equal(round.hits, 0);
  assert.equal(round.status, "done");
});
test("good timing, early timing and non-finite clock", () => {
  let round = newArcadeRound(0);
  round = tapArcade(round, nextBeatAt(round) - 150);
  assert.equal(round.score, 50);
  assert.equal(round.hits, 1);
  const before = round;
  assert.equal(advanceArcade(before, NaN), before);
});
test("XR thumbstick uses right axes, deadzone and bounded movement", () => {
  assert.deepEqual(readXRStick({ axes: [0,0,0.7,-0.6] }),{x:0.7,y:-0.6});
  assert.deepEqual(readXRStick({ axes: [0.05,0.05] }),{x:0,y:0});
  assert.deepEqual(readXRStick(null),{x:0,y:0});
  let p={x:0,z:0};
  p=boundedWalk(p,{x:0,y:-1},{x:0,z:-1},0.05);
  assert.ok(p.z < 0);
  for(let i=0;i<1000;i++) p=boundedWalk(p,{x:1,y:-1},{x:0,z:-1},0.1);
  assert.ok(p.x<=5.4&&p.z>=-1.7);
});
test("hand grab only when real wrist coordinate lies near disc", () => {
  const a={x:-1.45,y:1.1,z:-2.3},b={x:1.45,y:1.1,z:-2.3};
  assert.equal(nearestDeck({x:-1.42,y:1.12,z:-2.32},a,b),"A");
  assert.equal(nearestDeck({x:1.44,y:1.1,z:-2.3},a,b),"B");
  assert.equal(nearestDeck({x:0,y:1,z:-2},a,b),null);
  assert.equal(nearestDeck(null,a,b),null);
});
test("the vendored OverStrings gesture core has real 25-joint data semantics", () => {
  assert.equal(JOINT_NAMES.length,25);
  assert.equal(recognizeGesture(null),"unknown");
  const tracker=new GestureTracker();
  assert.deepEqual(tracker.update("left",null,0),[]);
  assert.equal(tracker.active("left"),"neutral");
});
