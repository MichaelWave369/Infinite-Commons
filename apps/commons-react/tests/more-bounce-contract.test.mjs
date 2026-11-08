import { test } from "node:test";
import assert from "node:assert/strict";
import { MORE_BOUNCE_ORIGIN, BACKSPIN_URL, XR_CHANNEL, COMMONS_VENUE_ID, mayConnectBooth, makeXRCommand, validBoothReply } from "../src/moreBounceProtocol.mjs";
test("venue is additive and booth remains an explicit external app", () => {
  assert.equal(COMMONS_VENUE_ID, "commons.venue.more-bounce.v1");
  assert.equal(BACKSPIN_URL, MORE_BOUNCE_ORIGIN + "/MoreBounceLabs/backspin.html");
});
test("bridge requires matching Pages origin", () => {
  assert.equal(mayConnectBooth(MORE_BOUNCE_ORIGIN), true);
  assert.equal(mayConnectBooth("http://localhost:5173"), false);
});
test("no arbitrary app or media controls", () => {
  assert.equal(makeXRCommand("import", { path: "/secret" }), null);
  assert.equal(makeXRCommand("scratch", { deck: "A", value: 999 }), null);
  assert.equal(makeXRCommand("play", { deck: "C" }), null);
  assert.deepEqual(makeXRCommand("crossfade", { value: -1 }), { channel: XR_CHANNEL, version: 1, type: "crossfade", value: -1 });
});
test("responses must come from the expected origin and version", () => {
  assert.equal(validBoothReply(MORE_BOUNCE_ORIGIN, { channel: XR_CHANNEL, version: 1, type: "hello" }), true);
  assert.equal(validBoothReply("https://attacker.invalid", { channel: XR_CHANNEL, version: 1, type: "hello" }), false);
  assert.equal(validBoothReply(MORE_BOUNCE_ORIGIN, { channel: XR_CHANNEL, version: 2, type: "hello" }), false);
});
