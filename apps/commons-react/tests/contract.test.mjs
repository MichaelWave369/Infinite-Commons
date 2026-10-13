import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PACKS, WORLD_NODES, WORLD_FINGERPRINT, validatePack } from "../../../web/packs.mjs";
import { validatePublicPhiSpace } from "../../../web/phispace-public.mjs";
import { parseLocalExport, localPreviewPanel } from "../../../web/phispace-local-preview.mjs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("React site reuses twenty original themes and fixed world nodes", () => {
  assert.equal(PACKS.length, 20);
  assert.ok(PACKS.every(validatePack));
  assert.equal(PACKS.filter((item) => item.featured).length, 2);
  assert.ok(WORLD_NODES.some((node) => node.id === "phispace.example"));
  assert.equal(WORLD_NODES.map((node) => node.id).join("|"), WORLD_FINGERPRINT);
  assert.ok(WORLD_NODES.every((node) => node.visibility === "public-demo"));
});

test("bundled demonstration PhiSpace is still validated and distinct from local exports", () => {
  const sample = JSON.parse(read("../../../web/fixtures/phispace-public.json"));
  const fixed = validatePublicPhiSpace(sample);
  assert.equal(fixed.publication_mode, "example-fixture");
  assert.throws(() => parseLocalExport(JSON.stringify(sample)), /owner-curated/);

  const manual = JSON.parse(read("../../../tests/fixtures/phispace/manual_public_draft.json"));
  const local = {
    schema: "commons.phispace.public.v0.1",
    publication_mode: "owner-curated-export",
    visibility: "public",
    space_id: manual.space_id,
    profile: manual.profile,
    sections: manual.sections
  };
  const preview = localPreviewPanel(parseLocalExport(JSON.stringify(local)));
  assert.match(preview.kind, /UNVERIFIED/);
  assert.match(preview.cards[0][1], /Not an authenticated owner/);
});

test("React code owns presentation and does not replace trust or networking contracts", () => {
  const app = read("../src/App.jsx");
  const scene = read("../src/Scene.jsx");
  assert.match(app, /from "\.\.\/\.\.\/\.\.\/web\/packs\.mjs"/);
  assert.match(app, /createLocalPreviewController/);
  assert.match(app, /validatePublicPhiSpace/);
  assert.match(scene, /index\.html\?raw/);
  assert.match(scene, /document\.importNode\(source, true\)/);
  assert.doesNotMatch(app + scene, /127\.0\.0\.1:7331|innerHTML|eval\(/);
});

test("Vite and Pages contract points at the repository subpath", () => {
  const workflow = read("../../../.github/workflows/deploy-commons-pages.yml");
  assert.match(workflow, /COMMONS_BASE_PATH: \/Infinite-Commons\//);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /branches: \[main\]/);
  assert.doesNotMatch(workflow, /pull_request:/);
});
