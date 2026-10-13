import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LOCAL_PUBLICATION_MODE, validateLocalExport, parseLocalExport,
  readSelectedExport, localPreviewPanel, createLocalPreviewController
} from "../phispace-local-preview.mjs";
import { MAX_MANIFEST_BYTES } from "../phispace-public.mjs";
import { sceneSnapshot } from "../app.mjs";

const draft = JSON.parse(readFileSync(
  new URL("../../tests/fixtures/phispace/manual_public_draft.json", import.meta.url), "utf8"
));

const sample = () => ({
  schema: "commons.phispace.public.v0.1",
  space_id: draft.space_id,
  visibility: "public",
  publication_mode: LOCAL_PUBLICATION_MODE,
  profile: structuredClone(draft.profile),
  sections: structuredClone(draft.sections)
});

function fileOf(content) {
  const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
  return { size: bytes.byteLength, arrayBuffer: async () => bytes.buffer.slice(
    bytes.byteOffset, bytes.byteOffset + bytes.byteLength
  ) };
}

test("local selection of PR5-shaped export is plain text and unverified", () => {
  const model = validateLocalExport(sample());
  assert.equal(model.publication_mode, LOCAL_PUBLICATION_MODE);
  assert.ok(Object.isFrozen(model));
  assert.ok(Object.isFrozen(model.profile));
  assert.ok(Object.isFrozen(model.sections[0]));
  const panel = localPreviewPanel(model);
  assert.equal(panel.title, draft.profile.display_name);
  assert.match(panel.kind, /UNVERIFIED LOCAL PREVIEW/);
  assert.match(panel.cards[0][1], /Not an authenticated owner/);
  assert.equal(panel.cards.length, draft.sections.length + 1);
});

test("fixture and extra authority fields are NOT accepted as user exports", () => {
  const value = sample();
  const rejects = [
    { ...value, publication_mode: "example-fixture" },
    { ...value, publication_mode: "live-published" },
    { ...value, visibility: "private" },
    { ...value, schema: "unknown" },
    { ...value, privatePath: "C:/secret" },
    { ...value, host: "http://127.0.0.1:7331" },
    { ...value, sections: [...value.sections, { ...value.sections[0] }] },
    { ...value, profile: { ...value.profile, welcome: "\u202ehello" } },
    { ...value, profile: { ...value.profile, secret: "test" } },
    { ...value, sections: [{ ...value.sections[0], href: "https://example.invalid" }] }
  ];
  for (const item of rejects) assert.throws(() => validateLocalExport(item), TypeError);
  assert.throws(() => parseLocalExport("not-json"), TypeError);
  assert.throws(() => parseLocalExport(JSON.stringify(value) + " ".repeat(MAX_MANIFEST_BYTES)), TypeError);
});

test("user-chosen file is constrained by byte count and valid UTF-8", async () => {
  const valid = JSON.stringify(sample());
  const imported = await readSelectedExport(fileOf(valid));
  assert.equal(imported.space_id, draft.space_id);
  await assert.rejects(readSelectedExport(fileOf(new Uint8Array(MAX_MANIFEST_BYTES + 1))), /16 KiB/);
  await assert.rejects(readSelectedExport(fileOf(new Uint8Array([0xff]))), /UTF-8/);
  await assert.rejects(readSelectedExport({ size: 100, arrayBuffer: async () => new ArrayBuffer(MAX_MANIFEST_BYTES + 1) }), /too large/);
  await assert.rejects(readSelectedExport(null), /Choose a JSON file/);
  await assert.rejects(readSelectedExport(fileOf('{"other":"shape"}')), TypeError);
});

test("preview lifecycle: import, withdraw, and no persistent state", async () => {
  const a = createLocalPreviewController();
  const b = createLocalPreviewController();
  const input = fileOf(JSON.stringify(sample()));
  assert.equal(a.get(), null);
  assert.equal(await a.load(input), true);
  assert.ok(a.get());
  assert.equal(b.get(), null);
  assert.deepEqual(
    sceneSnapshot("midnight-sierra").visibleNodes,
    sceneSnapshot("cloudgarden").visibleNodes
  );
  a.withdraw();
  assert.equal(a.get(), null);
  assert.equal(b.get(), null);
});

test("withdraw or supersede during an unresolved read prevents stale resurrection", async () => {
  const waiting = [];
  const controller = createLocalPreviewController(() => new Promise((resolve) => waiting.push(resolve)));
  const load1 = controller.load(fileOf(JSON.stringify(sample())));
  controller.withdraw();
  waiting[0](sample());
  assert.equal(await load1, false);
  assert.equal(controller.get(), null);

  const load2 = controller.load(fileOf(JSON.stringify(sample())));
  const load3 = controller.load(fileOf(JSON.stringify(sample())));
  waiting[1](sample());
  waiting[2](sample());
  assert.equal(await load2, false);
  assert.equal(await load3, true);
  assert.ok(controller.get());
  controller.withdraw();
  assert.equal(controller.get(), null);
});

test("invalid next selection clears previous preview", async () => {
  const c = createLocalPreviewController();
  assert.equal(await c.load(fileOf(JSON.stringify(sample()))), true);
  assert.ok(c.get());
  await assert.rejects(c.load(fileOf("oops")), /invalid JSON/);
  assert.equal(c.get(), null);
});
