# Infinite Commons R6: ThinkTank TT-35 Local Council Handoff

**Status:** export-only, one-way, operator-reviewed **local JSON contract**. This is the first file-format interop rung between the public Commons Nested Council Chambers and the separate *real* ThinkTank local Ollama council runner. It is **not** a network integration, auto-execution, cross-site authentication, live browser model access, evidence verification, or proof of local availability.

## Grounded existing ThinkTank implementation

This interop was based on the actual checked-in public source of [ThinkTank's `src/localCouncil.ts`](https://github.com/MichaelWave369/think-tank/blob/main/src/localCouncil.ts), its matching [sample fixture](https://github.com/MichaelWave369/think-tank/blob/main/tests/fixtures/local-council.sample.json), its [local governed council CLI documentation](https://github.com/MichaelWave369/think-tank/blob/main/docs/LOCAL_GOVERNED_COUNCIL_RUNNER.md), and `src/domain/modes.ts` inspected on October 23, 2026.

ThinkTank TT-35 already supports a **separately installed** and explicitly human-approved local CLI for Ollama inference. It uses ThinkTank's existing governed session runner, Crane Fly, role scheduling, Challenger, Reality Gate, ledger and replay verification. Unlike the static Commons site, the independently operated ThinkTank CLI can do real local model work *after* the operator approves the exact file SHA-256 and confirms the run. A withheld dossier remains a valid outcome.

This PR does **not** add or expose any provider bridge endpoint to Commons.

## The new Bridge Desk

The Commons Council Chambers wing now has a separate **From the Commons to ThinkTank** panel. The human:

1. **Explicitly** enters a new directive or chooses **Copy current practice agenda into directive**, which copies only the textual agenda from the Commons practice chambers. It neither imports fixture statements nor claims that any completed fictional deliberation is independent evidence.
2. Selects a TT-35-supported governed mode: `council` (5 turns), `trio` (3), or `audit` (2).
3. Enters the **exact name** of a locally installed Ollama model. Commons **cannot verify** this name or query the machine.
4. Chooses a bounded time budget from 30 to 600 seconds.
5. Reads a visible JSON preview, then explicitly checks a disclosure indicating that the downloaded file is **not** an approval or an inference trigger.
6. Clicks **Download local ThinkTank council contract** to download `commons-thinktank-local-council.json`.

The generated input has **exactly 11 fields** expected by TT-35 and exactly four authority switches pinned to `false`:

```json
{
  "schema": "phi-thinktank-local-council.v0.1",
  "mode": "council",
  "directive": "Investigate release evidence and identify unsupported completion claims without approving external action.",
  "provider": "ollama-local-only",
  "model": "gemma3:12b",
  "maxRoleTurns": 5,
  "maxSessionSeconds": 180,
  "allowRemoteProviders": false,
  "browserAutoRun": false,
  "executionAuthorityGranted": false,
  "externalDoneAttested": false
}
```

That example model name is illustrative. It is **not** an assertion the model is currently installed.

## Human-only next steps after download

From a separately installed, reviewed ThinkTank repository:

```sh
# Start the locally installed Ollama runtime, configure ThinkTank's
# provider output caps, and run the local provider bridge in another terminal.
npm run bridge

# Build the explicit terminal-only local council tool:
npm run council:build

# Inspect the downloaded file and obtain the exact SHA-256:
npm run council:inspect -- /absolute/path/commons-thinktank-local-council.json
```

Read the actual JSON bytes and the CLI plan/digest. Only after confirming local compute consent and budget:

```sh
npm run council:run -- /absolute/path/commons-thinktank-local-council.json \
  --approve-sha256=THE_64_CHARACTER_SHA_FROM_INSPECT \
  --confirm-local-model-inference
```

**The SHA value is not computed or approved by Commons.** ThinkTank's CLI must inspect the exact downloaded bytes before the user confirms a run. A digest is a change-detection/approval binding, not an author-signature or truth check. ThinkTank may refuse the run for missing models, provider readiness, unsupported state, mismatched SHA or policy failures. No paid remote providers are authorized by the contract. Running local inference may use substantial compute; the CLI's wall-clock abort cannot guarantee Ollama stops immediately.

The ledger/dossier, if any, remains with ThinkTank on the user's computer. No automatic import into Commons or return channel is added here. Do not place secrets or sensitive records in the exported directive without considering local artifact retention.

## Security and scope

- `src/thinkTankLocalHandoff.mjs` is a pure built-in contract validator/serializer mirroring the strict TT-35 mode, field, model-name, directive, time-budget, and authority rules. Unsupported modes, extra fields, URL-looking model strings, control characters, or elevated flags fail closed.
- `src/ThinkTankLocalHandoff.jsx` renders a native browser form, readable JSON preview and explicit download via local Blob. Changing an input clears the previous review checkbox, and downloading transmits nothing.
- No network calls, `localhost` requests, cookies, account tracking, new permissions, public proxy, automatic model execution, `localStorage` saving, clipboard transfer, or background tasks.
- Links to ThinkTank source and documentation only open **on deliberate click** in a separate tab.
- All R1–R5 Commons features, four canonical world nodes, twenty appearances, five-seat original STATION practice ceremony, three offline practice chambers, Explorer's Trail, Portal Plaza, Wayfinder and PhiSpace owner boundaries remain untouched.
- No claim of deployed cross-repo integration is made. The schema is grounded in current ThinkTank source but a separately installed/updated CLI remains the final compatibility and execution authority.

## Tests

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Node tests compare the exact published TT-35 sample shape, mode budgets, authority zeros, strict-field refusal and unchanged Commons invariants. Chromium tests use an actual browser download to verify the file bytes, explicit confirmation gate, reset after edits, mode switching, invalid-model fail-closed state, mobile viewport, and absence of provider traffic.

**The Commons proposes. The operator inspects. ThinkTank governs execution.**

**LEDGER ABOVE EGO · MANY MINDS · NO THRONES · STATIONNNNN!**
