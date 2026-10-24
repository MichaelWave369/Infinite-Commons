import test from "node:test";
import assert from "node:assert/strict";
import {
  THINKTANK_CONTRACT_SCHEMA, THINKTANK_HANDOFF_VERSION,
  THINKTANK_CONTRACT_FILENAME, THINKTANK_LOCAL_MODES, THINKTANK_LOCAL_STEPS,
  THINKTANK_SOURCE_LINKS, inspectThinkTankLocalContract,
  buildThinkTankLocalContract, formatThinkTankLocalContract
} from "../src/thinkTankLocalHandoff.mjs";
import { WORLD_NODES, WORLD_FINGERPRINT, PACKS } from "../../../web/packs.mjs";

const complete = Object.freeze({
  directive: "Investigate release evidence and identify unsupported completion claims without approving external action.",
  model: "gemma3:12b",
  mode: "council",
  maxSessionSeconds: 180
});

test("R6 emits exact ThinkTank TT-35 published sample contract, with zero authority flags", () => {
  const actual = buildThinkTankLocalContract(complete);
  assert.equal(THINKTANK_CONTRACT_SCHEMA, "phi-thinktank-local-council.v0.1");
  assert.equal(THINKTANK_HANDOFF_VERSION, "commons.thinktank-handoff.export-only.v0.6");
  assert.equal(THINKTANK_CONTRACT_FILENAME, "commons-thinktank-local-council.json");
  assert.deepEqual(actual, {
    schema: "phi-thinktank-local-council.v0.1",
    mode: "council",
    directive: complete.directive,
    provider: "ollama-local-only",
    model: "gemma3:12b",
    maxRoleTurns: 5,
    maxSessionSeconds: 180,
    allowRemoteProviders: false,
    browserAutoRun: false,
    executionAuthorityGranted: false,
    externalDoneAttested: false
  });
  assert.ok(Object.isFrozen(actual));
  assert.strictEqual(inspectThinkTankLocalContract(actual), actual);
  assert.deepEqual(JSON.parse(formatThinkTankLocalContract(actual)), actual);
  assert.ok(formatThinkTankLocalContract(actual).endsWith("\n"));
});

test("TT-35 council, trio and audit role budgets and queue order are exact", () => {
  assert.deepEqual(THINKTANK_LOCAL_MODES.map(m => [m.id, m.turns]), [
    ["council", 5], ["trio", 3], ["audit", 2]
  ]);
  assert.deepEqual(THINKTANK_LOCAL_MODES.map(m => m.roles), [
    ["dreamer", "builder", "challenger", "archivist", "vessie"],
    ["dreamer", "builder", "challenger"],
    ["challenger", "archivist"]
  ]);
  assert.ok(Object.isFrozen(THINKTANK_LOCAL_MODES));
  for (const mode of THINKTANK_LOCAL_MODES) {
    assert.ok(Object.isFrozen(mode) && Object.isFrozen(mode.roles));
    const made = buildThinkTankLocalContract({ ...complete, mode: mode.id });
    assert.equal(made.mode, mode.id);
    assert.equal(made.maxRoleTurns, mode.turns);
  }
});

test("invalid directives, uninstalled-looking model names and duration limits fail closed", () => {
  for (const directive of ["", "   ", "abcd", "x".repeat(1201), "test\u0000control"]) {
    assert.throws(() => buildThinkTankLocalContract({ ...complete, directive }), /Directive/);
  }
  for (const model of ["", " with spaces ", "https://evil.example", "model..other",
    ":ollama", "<script>", "x".repeat(91), "g\nmodel"]) {
    assert.throws(() => buildThinkTankLocalContract({ ...complete, model }), /model/i);
  }
  for (const maxSessionSeconds of [0, 29, 601, 500.2, null, undefined, 1e12]) {
    assert.throws(() => buildThinkTankLocalContract({ ...complete, maxSessionSeconds }), /Duration/);
  }
  for (const mode of ["live", "build", "dream", "toString", "__proto__", null]) {
    assert.throws(() => buildThinkTankLocalContract({ ...complete, mode }), /reviewed/);
  }
});

test("strict reader rejects missing, additional, forged or elevated contract properties", () => {
  const safe = buildThinkTankLocalContract(complete);
  const fields = Object.keys(safe);
  assert.deepEqual(fields, ["schema", "mode", "directive", "provider", "model",
    "maxRoleTurns", "maxSessionSeconds", "allowRemoteProviders", "browserAutoRun",
    "executionAuthorityGranted", "externalDoneAttested"]);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, url: "https://evil.example" }), /fields/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, provider: "openai" }), /schema/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, maxRoleTurns: 6 }), /turn/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, allowRemoteProviders: true }), /flags/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, browserAutoRun: true }), /flags/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, executionAuthorityGranted: true }), /flags/);
  assert.throws(() => inspectThinkTankLocalContract({ ...safe, externalDoneAttested: true }), /flags/);
  for (const missing of fields) {
    const candidate = { ...safe };
    delete candidate[missing];
    assert.throws(() => inspectThinkTankLocalContract(candidate), /fields/);
  }
  assert.throws(() => inspectThinkTankLocalContract(null), /fields/);
});

test("public help documents independently installed CLI approval but contains no auto-run URL", () => {
  assert.equal(THINKTANK_LOCAL_STEPS.length, 6);
  assert.ok(THINKTANK_LOCAL_STEPS.some(step => step.includes("council:inspect")));
  assert.ok(THINKTANK_LOCAL_STEPS.some(step => step.includes("--approve-sha256=THE_SHA_FROM_INSPECT")));
  assert.ok(THINKTANK_LOCAL_STEPS.some(step => step.includes("--confirm-local-model-inference")));
  assert.ok(Object.values(THINKTANK_SOURCE_LINKS).every(link => link.startsWith("https://github.com/MichaelWave369/think-tank")));
  assert.equal(WORLD_NODES.map(n => n.id).join("|"), WORLD_FINGERPRINT);
  assert.equal(WORLD_NODES.length, 4);
  assert.equal(PACKS.length, 20);
});
