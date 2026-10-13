import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  PUBLIC_SCHEMA, EXAMPLE_SPACE_ID, FIXTURE_PATH, MAX_MANIFEST_BYTES,
  validatePublicPhiSpace, parsePublicPhiSpace, loadExamplePhiSpace, phiSpacePanel
} from "../phispace-public.mjs";

const fixture = readFileSync(new URL("../fixtures/phispace-public.json", import.meta.url), "utf8");
const copy = () => JSON.parse(fixture);

test("valid curated public fixture yields a detached immutable manifest", () => {
  const raw = copy();
  const manifest = parsePublicPhiSpace(fixture);
  assert.equal(manifest.schema, PUBLIC_SCHEMA);
  assert.equal(manifest.space_id, EXAMPLE_SPACE_ID);
  assert.equal(manifest.visibility, "public");
  assert.equal(manifest.sections.length, 4);
  assert.ok(Object.isFrozen(manifest));
  assert.ok(Object.isFrozen(manifest.profile));
  assert.ok(Object.isFrozen(manifest.sections));
  assert.ok(Object.isFrozen(manifest.sections[0]));
  raw.profile.display_name = "Modified";
  assert.equal(manifest.profile.display_name, "The Lantern Room");
  const panel = phiSpacePanel(manifest);
  assert.equal(panel.title, "The Lantern Room");
  assert.equal(panel.cards.length, manifest.sections.length + 1);
});

test("unknown fields, private content and non-fixture publications fail closed", () => {
  const base = copy();
  const attempts = [
    { ...base, admin: true },
    { ...base, visibility: "private" },
    { ...base, visibility: "unlisted" },
    { ...base, publication_mode: "automatic" },
    { ...base, schema: "commons.phispace.public.v99" },
    { ...base, space_id: "../private" },
    { ...base, space_id: "phispace.other", private_path: "C:/Users" },
    { ...base, profile: { ...base.profile, email: "secret@example.invalid" } },
    { ...base, sections: [...base.sections, { id: "private", kind: "about", title: "Oops", body: "Not allowed", path: "/etc/passwd" }] },
    { ...base, sections: [{ ...base.sections[0], kind: "script" }] },
    { ...base, sections: [{ ...base.sections[0], id: "about" }, { ...base.sections[0], id: "about" }] },
    { ...base, sections: [] },
    { ...base, sections: base.sections.slice(0, 1).map((s) => ({ ...s, body: "\u202Epoof" })) },
    { ...base, profile: { ...base.profile, welcome: "z".repeat(501) } }
  ];
  for (const attempt of attempts) {
    assert.throws(() => validatePublicPhiSpace(attempt), TypeError);
  }
  assert.throws(() => parsePublicPhiSpace("{no-json"), TypeError);
  assert.throws(() => parsePublicPhiSpace("x".repeat(MAX_MANIFEST_BYTES + 1)), TypeError);
});

test("loader only requests fixed same-origin fixture without credentials or redirects", async () => {
  let seen = 0;
  const manifest = await loadExamplePhiSpace(async (path, options) => {
    seen++;
    assert.equal(path, FIXTURE_PATH);
    assert.deepEqual(options, {
      credentials: "omit", redirect: "error", mode: "same-origin", cache: "no-store"
    });
    return { ok: true, text: async () => fixture };
  });
  assert.equal(seen, 1);
  assert.equal(manifest.profile.display_name, "The Lantern Room");
});

test("loader refuses failed fetch or mismatched doorway and never falls back", async () => {
  await assert.rejects(
    () => loadExamplePhiSpace(async () => ({ ok: false, text: async () => fixture })),
    /unavailable/
  );
  const other = copy();
  other.space_id = "phispace.not-example";
  await assert.rejects(
    () => loadExamplePhiSpace(async () => ({ ok: true, text: async () => JSON.stringify(other) })),
    /not mapped/
  );
  assert.throws(() => phiSpacePanel(validatePublicPhiSpace(other)), /unrecognized/);
});

test("manifest contains text-only content and no network authority or file locator", () => {
  const manifest = parsePublicPhiSpace(fixture);
  const serialized = JSON.stringify(manifest);
  assert.doesNotMatch(serialized, /https?:\/\//);
  assert.doesNotMatch(serialized, /(?:private_path|file_path|capability|token|secret|authorization)/i);
  assert.deepEqual(Object.keys(manifest).sort(), [
    "profile", "publication_mode", "schema", "sections", "space_id", "visibility"
  ]);
});
