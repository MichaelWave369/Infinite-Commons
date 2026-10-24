import { test, expect } from "@playwright/test";
import { dossierChecksum } from "../src/thinkTankReturnReview.mjs";

const mkDossier = () => {
  const dossier = {
    id: "DOS-0003", sessionId: "review-test-101", seed: "fixture",
    decisionSeq: 3, mode: "audit", executionSource: "live-provider",
    operatorPrompt: "Audit release assumptions", outcome: "withheld",
    outputLabel: "WITHHELD", actionAllowed: false,
    gateScore: 0.6, gateThreshold: 0.75, gateBreakdown: null,
    claimGovernance: null, argumentGovernance: null, objectionCount: 1,
    faultCode: "", governanceReason: "No independent evidence",
    assignments: [], claims: [], bindings: [], evidence: [], excerpts: [],
    claimReviews: [], argumentReviews: [],
    providerTurns: [
      { seq: 1, roleId: "challenger", seatId: "local", providerModel: "gemma3:12b", providerRequestId: "" },
      { seq: 2, roleId: "archivist", seatId: "local", providerModel: "gemma3:12b", providerRequestId: "" }
    ]
  };
  dossier.basisFingerprint = dossierChecksum(dossier);
  return dossier;
};
const mkLedger = dossier => ({
  schema: "phi-thinktank-local-council-result.v0.1",
  contractSha256: "a".repeat(64),
  summary: { completed: true, aborted: false, error: null, turnsInvoked: 2, mode: "audit", model: "gemma3:12b" },
  authority: { provider: "ollama-local-only", executionAuthorityGranted: false, externalDoneAttested: false, independentEvidenceVerified: false },
  replay: { valid: true, exact: true },
  events: [
    { schemaVersion: 1, seq: 1, sessionId: "review-test-101", source: "provider", kind: "challenge.raised", roleId: "challenger", seatId: "local", providerModel: "gemma3:12b" },
    { schemaVersion: 1, seq: 2, sessionId: "review-test-101", source: "provider", kind: "utterance.complete", roleId: "archivist", seatId: "local", providerModel: "gemma3:12b" },
    { schemaVersion: 1, seq: 3, sessionId: "review-test-101", source: "system", kind: "synthesis.withheld", decisionDossier: dossier }
  ]
});
const upload = (name, value) => ({ name, mimeType: "application/json", buffer: Buffer.from(JSON.stringify(value)) });

test("return desk inspects two local-only mock files, crosschecks metadata and forgets everything", async ({ page }) => {
  const requests = [];
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", req => { if (/providers\/invoke|127\.0\.0\.1:3691/.test(req.url())) requests.push(req.url()); });
  await page.goto("./");
  await page.getByRole("link", { name: /RETURN DESK/ }).click();
  await expect(page.getByRole("heading", { name: /Inspect a ThinkTank return/ })).toBeVisible();
  const dossier = mkDossier();
  await page.getByLabel("Choose a local ThinkTank TT-35 ledger JSON")
    .setInputFiles(upload("council-mock-ledger.json", mkLedger(dossier)));
  const ledger = page.getByRole("region", { name: "ThinkTank local ledger review" });
  await expect(ledger.getByText("EXACT (SELF-REPORTED)")).toBeVisible();
  await expect(ledger).toContainText("gemma3:12b");
  await expect(ledger).toContainText("UNTRUSTED");
  await page.getByLabel("Choose the matching decision dossier JSON (optional)")
    .setInputFiles(upload("council-mock-decision-dossier.json", { dossier, override: null, seals: [] }));
  const reviewed = page.getByRole("region", { name: "ThinkTank local dossier review" });
  await expect(reviewed).toContainText("CONSISTENT · NON-CRYPTOGRAPHIC");
  const comparison = page.getByRole("region", { name: "ThinkTank two-file structural comparison" });
  await expect(comparison).toContainText("Files appear structurally consistent");
  await expect(comparison.locator("li")).toHaveCount(5);
  await expect(comparison).toContainText("NOT AUTHENTICITY OR VERIFIED REPLAY");
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "Clear all local review data" }).click();
  await expect(ledger).toHaveCount(0);
  await expect(reviewed).toHaveCount(0);
  await expect(comparison).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "ThinkTank local ledger review" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
});

test("mismatched and hostile return files are visibly rejected, without script execution or live calls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const ledgerFile = page.getByLabel("Choose a local ThinkTank TT-35 ledger JSON");
  await ledgerFile.setInputFiles(upload("bad.json", { schema: "evil-and-foreign" }));
  await expect(page.getByRole("alert")).toContainText("Not a ThinkTank TT-35 local ledger");
  await expect(page.getByRole("region", { name: "ThinkTank local ledger review" })).toHaveCount(0);
  const original = mkDossier();
  const forged = { ...original, operatorPrompt: "<img src=x onerror=alert(1)>", actionAllowed: true };
  await page.getByLabel("Choose the matching decision dossier JSON (optional)")
    .setInputFiles(upload("forged.json", { dossier: forged, override: null, seals: [] }));
  const review = page.getByRole("region", { name: "ThinkTank local dossier review" });
  await expect(review).toContainText("MISMATCH · DO NOT TRUST");
  await expect(review).toContainText("NOT GRANTED HERE");
  await expect(page.locator("img[src=x]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Convene five seats" })).toBeVisible();
});
