import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
const digest = body => createHash("sha256").update(body).digest("hex");
const localLedger = () => ({
  schema: "phi-thinktank-local-council-result.v0.1",
  contractSha256: "a".repeat(64),
  summary: { completed: false, aborted: false, turnsInvoked: 0, mode: "audit", model: "gemma3:12b" },
  authority: { provider: "ollama-local-only", executionAuthorityGranted: false, externalDoneAttested: false, independentEvidenceVerified: false },
  replay: { valid: true, exact: true },
  events: [{ seq: 1, sessionId: "PHI-0001", source: "operator", kind: "seat.status" }]
});
const file = (name, buffer) => ({ name, mimeType: "application/json", buffer });
const report = ledgerBytes => ({
  schema: "phi-thinktank-local-council-verification.v0.1",
  execution: "LOCAL_KERNEL_REPLAY_ONLY", result: "KERNEL_REPLAY_PASS",
  replayKernel: "think-tank/src/kernel/eventKernel.ts",
  ledgerSha256: digest(ledgerBytes), dossierSha256: null,
  contractSha256: "a".repeat(64),
  finalFingerprint: "fnv1a32:01234567", sessionId: "PHI-0001",
  mode: "audit", model: "gemma3:12b", eventCount: 1, providerTurnCount: 0,
  dossierId: null, dossierMatch: "NOT_SUPPLIED",
  authGranted: false, externalDone: false, truthAuthority: false,
  signerAuthenticated: false, independentlyAuthenticated: false,
  verifierOrigin: "local-operator-computer", localClockTrust: "untrusted-local-clock"
});

test("R8 locally recomputes SHA-256 of uploaded ledger bytes and labels unsigned pass as unauthenticated", async ({ page }) => {
  const errors = [], requests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", req => { if (/providers\/invoke|127\.0\.0\.1:3691/.test(req.url())) requests.push(req.url()); });
  await page.goto("./");
  await page.getByRole("link", { name: /RETURN DESK/ }).click();
  const data = Buffer.from(JSON.stringify(localLedger()), "utf8");
  await page.getByLabel("Choose a local ThinkTank TT-35 ledger JSON")
    .setInputFiles(file("ledger.json", data));
  await page.getByLabel("Choose an offline ThinkTank kernel replay verification report (optional)")
    .setInputFiles(file("verify.json", Buffer.from(JSON.stringify(report(data)))));
  const panel = page.getByRole("region", { name: "ThinkTank offline kernel replay receipt comparison" });
  await expect(panel).toContainText("Receipt matches the supplied artifact bytes");
  await expect(panel).toContainText("NOT AUTHENTICATED");
  await expect(panel.locator("li")).toHaveCount(9);
  await expect(panel).toContainText("No factual authority or external action permission");
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);

  const changed = localLedger();
  changed.events.push({ seq: 2, sessionId: "PHI-0001", kind: "operator.prompt", source: "operator" });
  await page.getByLabel("Choose a local ThinkTank TT-35 ledger JSON")
    .setInputFiles(file("changed-ledger.json", Buffer.from(JSON.stringify(changed))));
  await expect(panel).toContainText("Receipt does not match all supplied artifacts");
  await expect(panel).toContainText("MISMATCH · Exact ledger bytes");
  await page.getByRole("button", { name: "Clear all local review data" }).click();
  await expect(panel).toHaveCount(0);
  await page.reload();
  await expect(panel).toHaveCount(0);
});

test("R8 rejects unsigned report attempting authority elevation, preserving original five-seat STATION", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const data = Buffer.from(JSON.stringify(localLedger()));
  const unsafe = { ...report(data), authGranted: true, independentlyAuthenticated: true };
  await page.getByLabel("Choose an offline ThinkTank kernel replay verification report (optional)")
    .setInputFiles(file("unsafe.json", Buffer.from(JSON.stringify(unsafe))));
  await expect(page.getByRole("alert")).toContainText("Replay report rejected");
  await expect(page.getByRole("region", { name: "ThinkTank offline kernel replay receipt comparison" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Convene five seats" })).toBeVisible();
});
