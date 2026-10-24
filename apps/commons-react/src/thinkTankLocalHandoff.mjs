/**
 * R6: Static, one-way ThinkTank TT-35 local CLI handoff contract.
 *
 * Compatibility source: MichaelWave369/think-tank/src/localCouncil.ts
 * and tests/fixtures/local-council.sample.json, inspected 2026-10-23.
 * The resulting JSON is an INPUT FILE for an independently installed
 * terminal-only tool. Commons never executes, approves, posts or uploads it.
 */
export const THINKTANK_CONTRACT_SCHEMA = "phi-thinktank-local-council.v0.1";
export const THINKTANK_HANDOFF_VERSION = "commons.thinktank-handoff.export-only.v0.6";
export const THINKTANK_CONTRACT_FILENAME = "commons-thinktank-local-council.json";
export const THINKTANK_DIRECTIVE_LIMIT = 1200;
export const THINKTANK_MODEL_LIMIT = 90;
export const THINKTANK_SESSION_MIN = 30;
export const THINKTANK_SESSION_MAX = 600;

// Mode role counts are checked against ThinkTank src/domain/modes.ts (TT-35).
export const THINKTANK_LOCAL_MODES = Object.freeze([
  Object.freeze({ id: "council", name: "COUNCIL", turns: 5, roles: Object.freeze(["dreamer", "builder", "challenger", "archivist", "vessie"]) }),
  Object.freeze({ id: "trio", name: "TRIO", turns: 3, roles: Object.freeze(["dreamer", "builder", "challenger"]) }),
  Object.freeze({ id: "audit", name: "AUDIT", turns: 2, roles: Object.freeze(["challenger", "archivist"]) })
]);

const FIELDS = Object.freeze([
  "schema", "mode", "directive", "provider", "model", "maxRoleTurns",
  "maxSessionSeconds", "allowRemoteProviders", "browserAutoRun",
  "executionAuthorityGranted", "externalDoneAttested"
]);

function plain(value) {
  return value !== null && typeof value === "object" &&
    !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

export function inspectThinkTankLocalContract(contract) {
  if (!plain(contract) ||
      Object.keys(contract).sort().join("|") !== [...FIELDS].sort().join("|")) {
    throw new Error("Exact TT-35 contract fields required.");
  }
  const mode = THINKTANK_LOCAL_MODES.find(item => item.id === contract.mode);
  if (contract.schema !== THINKTANK_CONTRACT_SCHEMA ||
      contract.provider !== "ollama-local-only" || !mode) {
    throw new Error("Unsupported ThinkTank local schema, provider or mode.");
  }
  if (typeof contract.directive !== "string" ||
      contract.directive.trim().length < 5 ||
      contract.directive.length > THINKTANK_DIRECTIVE_LIMIT ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(contract.directive)) {
    throw new Error("Directive must be 5–1200 characters without forbidden controls.");
  }
  if (typeof contract.model !== "string" ||
      contract.model.length > THINKTANK_MODEL_LIMIT ||
      !/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,89}$/.test(contract.model) ||
      contract.model.includes("..")) {
    throw new Error("Specify a valid installed local model name.");
  }
  if (!Number.isInteger(contract.maxRoleTurns) || contract.maxRoleTurns !== mode.turns) {
    throw new Error("Model turn count must match ThinkTank's selected governed mode.");
  }
  if (!Number.isInteger(contract.maxSessionSeconds) ||
      contract.maxSessionSeconds < THINKTANK_SESSION_MIN ||
      contract.maxSessionSeconds > THINKTANK_SESSION_MAX) {
    throw new Error("Duration must be between 30 and 600 whole seconds.");
  }
  if (contract.allowRemoteProviders !== false || contract.browserAutoRun !== false ||
      contract.executionAuthorityGranted !== false || contract.externalDoneAttested !== false) {
    throw new Error("ThinkTank authority flags must all remain false.");
  }
  return contract;
}

export function buildThinkTankLocalContract({ mode, directive, model, maxSessionSeconds }) {
  const selected = THINKTANK_LOCAL_MODES.find(item => item.id === mode);
  if (!selected) throw new Error("Choose a reviewed ThinkTank mode.");
  const contract = {
    schema: THINKTANK_CONTRACT_SCHEMA,
    mode: selected.id,
    directive: typeof directive === "string" ? directive.trim() : directive,
    provider: "ollama-local-only",
    model: typeof model === "string" ? model.trim() : model,
    maxRoleTurns: selected.turns,
    maxSessionSeconds,
    allowRemoteProviders: false,
    browserAutoRun: false,
    executionAuthorityGranted: false,
    externalDoneAttested: false
  };
  inspectThinkTankLocalContract(contract);
  return Object.freeze(contract);
}

export function formatThinkTankLocalContract(contract) {
  inspectThinkTankLocalContract(contract);
  return JSON.stringify(contract, null, 2) + "\n";
}

/** Fixed literal instructions; approval digest MUST come from CLI inspect. */
export const THINKTANK_LOCAL_STEPS = Object.freeze([
  "Install and review the independent MichaelWave369/think-tank source and local dependencies.",
  "Run Ollama and the separately installed ThinkTank loopback bridge. Verify the exact model is available, provider caps, and resource budget.",
  "Review the downloaded contract bytes on your own machine. Use npm run council:build in ThinkTank if the CLI has not been built.",
  "Run: npm run council:inspect -- /absolute/path/commons-thinktank-local-council.json",
  "Read the CLI-reported SHA-256 and role plan. Only after verifying the file and deciding to spend local compute, run: npm run council:run -- /absolute/path/commons-thinktank-local-council.json --approve-sha256=THE_SHA_FROM_INSPECT --confirm-local-model-inference",
  "Inspect any resulting local ledger or dossier. Withheld synthesis is a valid outcome and no independent external action is ever authorized."
]);

export const THINKTANK_SOURCE_LINKS = Object.freeze({
  repository: "https://github.com/MichaelWave369/think-tank",
  contract: "https://github.com/MichaelWave369/think-tank/blob/main/src/localCouncil.ts",
  runner: "https://github.com/MichaelWave369/think-tank/blob/main/docs/LOCAL_GOVERNED_COUNCIL_RUNNER.md"
});
