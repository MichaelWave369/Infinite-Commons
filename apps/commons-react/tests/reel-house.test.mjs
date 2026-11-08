import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  REEL_HOUSE_WORLD_ID, REEL_NETWORK_URL, REEL_THEATER_URL, DEMO_VIDEO_URL,
  SEATS, MAX_LOCAL_VIDEO_BYTES, seatById, validateLocalVideo
} from "../src/reelHouseModel.mjs";

describe("REEL House isolated venue contract", () => {
  it("uses a stable new venue ID without modifying Commons semantic nodes", () => {
    assert.equal(REEL_HOUSE_WORLD_ID, "commons.venue.reel-house.v1");
    assert.equal(SEATS.length, 15);
    assert.equal(new Set(SEATS.map(s => s.id)).size, 15);
    assert.equal(seatById("row-2-seat-3")?.x, 0);
    assert.equal(seatById("unknown"), null);
  });
  it("links only to the real independent REEL projects", () => {
    assert.equal(REEL_NETWORK_URL, "https://michaelwave369.github.io/ReelCommons/");
    assert.equal(REEL_THEATER_URL, "https://michaelwave369.github.io/ReelTheater/");
    assert.match(DEMO_VIDEO_URL, /\/cc0-videos\/flower\.mp4$/);
  });
  it("accepts bounded user-selected video and rejects unsupported content", () => {
    assert.equal(validateLocalVideo({ type: "video/mp4", size: 500 }), null);
    assert.equal(validateLocalVideo({ type: "video/webm", size: MAX_LOCAL_VIDEO_BYTES }), null);
    assert.match(validateLocalVideo({ type: "text/html", size: 500 }), /MP4/);
    assert.match(validateLocalVideo({ type: "video/mp4", size: 0 }), /non-empty/);
    assert.match(validateLocalVideo({ type: "video/mp4", size: MAX_LOCAL_VIDEO_BYTES + 1 }), /2 GiB/);
    assert.match(validateLocalVideo(null), /Choose/);
  });
});
