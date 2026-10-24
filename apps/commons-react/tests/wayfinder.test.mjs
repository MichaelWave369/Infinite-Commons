import test from "node:test";
import assert from "node:assert/strict";
import {
  WAYFINDER_VERSION, WAYFINDER_BOOKMARK_KEY, WAYFINDER_DESTINATIONS,
  reviewedDestination, wayfinderById, parseWayfinderId,
  wayfinderSharePath, wayfinderClearPath, parseBookmarks, toggleBookmark
} from "../src/wayfinderPlan.mjs";

test("three curated public project destinations, each tied to documented HTTPS GitHub Pages owner", () => {
  assert.equal(WAYFINDER_VERSION, "commons.wayfinder.reviewed-v0.2");
  assert.deepEqual(WAYFINDER_DESTINATIONS.map(d => d.id), ["field-atlas", "field-constellation", "nevora-codex"]);
  assert.ok(Object.isFrozen(WAYFINDER_DESTINATIONS));
  assert.ok(WAYFINDER_DESTINATIONS.every(Object.isFrozen));
  assert.equal(new Set(WAYFINDER_DESTINATIONS.map(d => d.url)).size, 3);
  for (const d of WAYFINDER_DESTINATIONS) {
    assert.equal(reviewedDestination(d.id), d.url);
    assert.equal(new URL(d.url).origin, "https://michaelwave369.github.io");
    assert.match(d.verification, /UPTIME NOT CHECKED/);
    assert.match(d.evidence, /README/);
  }
  assert.match(wayfinderById("nevora-codex").kind, /NOT the Nevora game/);
});

test("no arbitrary URLs, unexpected destinations or untrusted IDs are navigable", () => {
  for (const value of [
    null, undefined, "", "https://evil.example", "javascript:alert(1)",
    "//evil.example", "field-atlas/../admin", "FIELD-ATLAS", "toString",
    "__proto__", "constructor"
  ]) {
    assert.equal(reviewedDestination(value), null);
    assert.equal(wayfinderById(value), null);
  }
  assert.equal(parseWayfinderId("?wayfinder=https%3A%2F%2Fevil.example"), null);
  assert.equal(parseWayfinderId("?wayfinder=field-atlas&wayfinder=nevora-codex"), null);
  assert.equal(parseWayfinderId("?wayfinder=toString"), null);
  assert.equal(parseWayfinderId("?" + "a".repeat(3000)), null);
});

test("deep links accept a known public ID and preserve unrelated app parameters", () => {
  assert.equal(parseWayfinderId("?wayfinder=field-atlas"), "field-atlas");
  assert.equal(parseWayfinderId("?other=ok&wayfinder=nevora-codex"), "nevora-codex");
  assert.equal(parseWayfinderId("?other=ok"), null);
  assert.equal(
    wayfinderSharePath("/Infinite-Commons/", "?theme=night&wayfinder=unknown", "field-constellation"),
    "/Infinite-Commons/?theme=night&wayfinder=field-constellation#portal-wayfinder"
  );
  assert.equal(
    wayfinderClearPath("/Infinite-Commons/", "?theme=night&wayfinder=nevora-codex"),
    "/Infinite-Commons/?theme=night#portal-wayfinder"
  );
  assert.equal(wayfinderSharePath("/Infinite-Commons/", "", "unknown"), null);
  assert.equal(wayfinderSharePath("//evil.example/path", "", "field-atlas"),
    "/?wayfinder=field-atlas#portal-wayfinder");
});

test("bookmarks are local only, malformed content is dropped, no write on parse", () => {
  assert.match(WAYFINDER_BOOKMARK_KEY, /wayfinder/);
  assert.deepEqual(parseBookmarks(null), []);
  assert.deepEqual(parseBookmarks("{oops"), []);
  assert.deepEqual(parseBookmarks(JSON.stringify(["field-atlas", "field-atlas", "__proto__", 1, "nevora-codex"])), [
    "field-atlas", "nevora-codex"
  ]);
  assert.deepEqual(toggleBookmark([], "field-atlas"), ["field-atlas"]);
  assert.deepEqual(toggleBookmark(["field-atlas"], "field-atlas"), []);
  assert.deepEqual(toggleBookmark(["field-atlas"], "javascript:alert(1)"), ["field-atlas"]);
  assert.ok(Object.isFrozen(toggleBookmark([], "nevora-codex")));
});
