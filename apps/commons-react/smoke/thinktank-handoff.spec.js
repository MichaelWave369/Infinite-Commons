import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("reviewed ThinkTank bridge exports an exact local-only TT-35 file without invoking models", async ({ page }) => {
  const errors = [];
  const bridgeRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("request", request => {
    if (/127\.0\.0\.1:3691|\/providers\/invoke|\/api\/chat/.test(request.url()))
      bridgeRequests.push(request.url());
  });

  await page.goto("./");
  await page.getByRole("link", { name: /THINKTANK BRIDGE/ }).click();
  await expect(page.getByRole("heading", { name: /From the Commons to ThinkTank/ })).toBeVisible();
  const exportButton = page.getByRole("button", { name: "Download local ThinkTank council contract ↓" });
  await expect(exportButton).toBeDisabled();

  await page.getByRole("button", { name: /Copy current practice agenda into directive/ }).click();
  await page.getByRole("textbox", { name: "Exact installed Ollama model name" }).fill("gemma3:12b");
  await expect(page.getByLabel("ThinkTank local council JSON preview")).toBeVisible();
  const preview = await page.getByLabel("ThinkTank local council JSON preview").innerText();
  const parsed = JSON.parse(preview);
  expect(parsed).toEqual({
    schema: "phi-thinktank-local-council.v0.1",
    mode: "council",
    directive: "How should independent worlds and councils collaborate without surrendering control?",
    provider: "ollama-local-only",
    model: "gemma3:12b",
    maxRoleTurns: 5,
    maxSessionSeconds: 180,
    allowRemoteProviders: false,
    browserAutoRun: false,
    executionAuthorityGranted: false,
    externalDoneAttested: false
  });
  await expect(exportButton).toBeDisabled();
  await page.getByRole("checkbox", { name: /I reviewed the file contents/ }).check();
  const [download] = await Promise.all([page.waitForEvent("download"), exportButton.click()]);
  expect(download.suggestedFilename()).toBe("commons-thinktank-local-council.json");
  const data = await readFile(await download.path(), "utf8");
  expect(JSON.parse(data)).toEqual(parsed);
  await expect(page.getByText("Local contract download requested.", { exact: false })).toBeVisible();
  expect(bridgeRequests).toEqual([]);
  expect(errors).toEqual([]);

  await page.getByRole("textbox", { name: "Operator directive (minimum 5 characters)" }).fill("Review this as an untrusted test.");
  await expect(exportButton).toBeDisabled();
});

test("TT-35 bridge mode changes enforce their own role budget and cannot approve remote providers", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: /Copy current practice agenda into directive/ }).click();
  await page.getByRole("textbox", { name: "Exact installed Ollama model name" }).fill("qwen3:4b");

  const mode = page.getByRole("combobox", { name: "Governed ThinkTank mode" });
  const preview = page.getByLabel("ThinkTank local council JSON preview");
  await mode.selectOption("trio");
  await expect(preview).toContainText('"maxRoleTurns": 3');
  await mode.selectOption("audit");
  await expect(preview).toContainText('"maxRoleTurns": 2');
  await mode.selectOption("council");
  await expect(preview).toContainText('"maxRoleTurns": 5');
  await expect(preview).toContainText('"allowRemoteProviders": false');
  await expect(preview).toContainText('"browserAutoRun": false');
  await expect(preview).toContainText('"executionAuthorityGranted": false');
  await expect(preview).toContainText('"externalDoneAttested": false');

  await page.getByRole("textbox", { name: "Exact installed Ollama model name" }).fill("https://malicious.example");
  await expect(page.getByLabel("ThinkTank local council JSON preview")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download local ThinkTank council contract ↓" })).toBeDisabled();
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Convene five seats" })).toBeVisible();
});
