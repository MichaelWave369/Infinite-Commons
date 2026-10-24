import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const historyFile = value => ({
  name:"historical-key-journal.json", mimeType:"application/json",
  buffer:Buffer.from(JSON.stringify(value))
});

async function registerKey(page, fingerprint, label) {
  await page.getByLabel("Ed25519 SPKI SHA-256 fingerprint").fill(fingerprint);
  await page.getByLabel("Human-readable key label").fill(label);
  await page.getByLabel("Where did you verify this fingerprint independently?")
    .fill("Checked on my separately stored offline key printout.");
  await page.getByRole("checkbox",{name:/I independently checked this key fingerprint/}).check();
  await page.getByRole("button",{name:"Add reviewed key to this local journal"}).click();
}

async function checkpoint(page) {
  await page.getByRole("button",{name:"Compute current history checkpoint"}).click();
  const section=page.getByRole("region",{name:"Current key-history checkpoint"});
  await expect(section.locator("code")).toHaveText(/^[0-9a-f]{64}$/);
  const hash=(await section.locator("code").innerText()).trim();
  const label=(await section.locator("strong").innerText()).trim();
  const count=Number(label.match(/\d+$/)?.[0]);
  return {hash,count};
}

async function compare(page,count,hash) {
  await page.getByLabel("Reference event count").fill(String(count));
  await page.getByLabel("Reference SHA-256 (64 hex characters)").fill(hash);
  await page.getByRole("checkbox",{name:/I obtained this checkpoint from a separately preserved source/}).check();
  await page.getByRole("button",{name:"Check history against saved reference"}).click();
  return page.getByRole("region",{name:"Independent key-history checkpoint comparison"});
}

test("R11 detects a stale backup versus an independently kept post-revocation checkpoint",async({page})=>{
  const errors=[],providerRequests=[];
  page.on("pageerror",err=>errors.push(err.message));
  page.on("request",r=>{if(/providers\/invoke|127\.0\.0\.1:3691/.test(r.url()))providerRequests.push(r.url());});
  await page.goto("./");
  await registerKey(page,"a".repeat(64),"Primary signer");
  const original=await checkpoint(page);
  expect(original.count).toBe(1);

  const [oldDownload]=await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button",{name:"Export unsigned key-history JSON ↓"}).click()
  ]);
  const oldHistory=JSON.parse(await readFile(await oldDownload.path(),"utf8"));
  const [checkpointDownload]=await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button",{name:"Download checkpoint JSON ↓"}).click()
  ]);
  expect(checkpointDownload.suggestedFilename()).toBe("commons-key-history-checkpoint.json");
  const exportedCheckpoint=JSON.parse(await readFile(await checkpointDownload.path(),"utf8"));
  expect(exportedCheckpoint.eventCount).toBe(1);
  expect(exportedCheckpoint.headSha256).toBe(original.hash);

  await page.getByLabel("Select an active key").selectOption("a".repeat(64));
  await page.getByLabel("Operator reason").fill("Revoked after discovering a compromised machine.");
  await page.getByRole("checkbox",{name:/I understand this closes the selected key/}).check();
  await page.getByRole("button",{name:"Apply local key status change"}).click();
  const newReference=await checkpoint(page);
  expect(newReference.count).toBe(2);
  const comparison=await compare(page,original.count,original.hash);
  await expect(comparison).toContainText("REFERENCE PREFIX MATCHES · LATER EVENTS PRESENT");

  await page.getByRole("checkbox",{name:/I understand this is an unauthenticated file/}).check();
  await page.getByLabel("Import local unsigned key-history JSON").setInputFiles(historyFile(oldHistory));
  await expect(page.getByRole("region",{name:"Operator key-history journal"})).toContainText("ACTIVE");

  const rollback=await compare(page,newReference.count,newReference.hash);
  await expect(rollback).toContainText("OLDER THAN PROVIDED REFERENCE · POSSIBLE ROLLBACK");
  await expect(rollback).toContainText("Reference is not supported by this history");
  expect(errors).toEqual([]);
  expect(providerRequests).toEqual([]);
});

test("R11 detects edited key notes and correctly warns an old authentic checkpoint is insufficient",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./");
  await registerKey(page,"b".repeat(64),"Signer Beta");
  const reference=await checkpoint(page);
  const [download]=await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button",{name:"Export unsigned key-history JSON ↓"}).click()
  ]);
  const tampered=JSON.parse(await readFile(await download.path(),"utf8"));
  tampered.events[0].sourceNote="A different, attacker-edited source claim.";
  await page.getByRole("checkbox",{name:/I understand this is an unauthenticated file/}).check();
  await page.getByLabel("Import local unsigned key-history JSON").setInputFiles(historyFile(tampered));
  const panel=await compare(page,reference.count,reference.hash);
  await expect(panel).toContainText("REFERENCE HASH MISMATCH · HISTORY DIVERGED");
  await expect(page.getByText(/an obsolete genuine checkpoint/)).toBeVisible();
  await expect(page.getByRole("button",{name:"Convene five seats"})).toBeVisible();
});
