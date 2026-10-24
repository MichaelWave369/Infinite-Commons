import { test, expect } from "@playwright/test";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const inputFile = (name, value) => ({
  name, mimeType:"application/json",
  buffer: Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(value))
});
function signedFixture(){
  const report={
    schema:"phi-thinktank-local-council-verification.v0.1",execution:"LOCAL_KERNEL_REPLAY_ONLY",
    result:"KERNEL_REPLAY_PASS",replayKernel:"think-tank/src/kernel/eventKernel.ts",
    ledgerSha256:"a".repeat(64),dossierSha256:null,contractSha256:"b".repeat(64),
    finalFingerprint:"fnv1a32:01234567",mode:"audit",model:"gemma3:12b",
    sessionId:"PHI-0001",eventCount:1,providerTurnCount:0,dossierId:null,
    dossierMatch:"NOT_SUPPLIED",authGranted:false,externalDone:false,
    truthAuthority:false,signerAuthenticated:false,independentlyAuthenticated:false,
    verifierOrigin:"local-operator-computer",localClockTrust:"untrusted-local-clock"
  };
  const reportBytes=Buffer.from(JSON.stringify(report));
  const {privateKey,publicKey}=generateKeyPairSync("ed25519");
  const spki=publicKey.export({format:"der",type:"spki"});
  const reportDigest=sha(reportBytes);
  return {reportBytes,signature:{
    schema:"phi-thinktank-local-replay-signature.v0.1",
    domain:"PHI_THINKTANK_LOCAL_REPLAY_SIGNATURE_V1",algorithm:"Ed25519",
    messageEncoding:"utf8-domain-plus-sha256-hex",reportSha256:reportDigest,
    publicKeySpkiBase64:spki.toString("base64"),publicKeyFingerprintSha256:sha(spki),
    signatureBase64:sign(null,Buffer.from("PHI_THINKTANK_LOCAL_REPLAY_SIGNATURE_V1\n"+reportDigest),privateKey).toString("base64"),
    signerLabel:"operator-selected-local-key",
    authGranted:false,externalDone:false,truthAuthority:false,signerAuthenticated:false
  }};
}

test("R10 revocation overrides current human fingerprint pin but preserves valid signature math",async({page})=>{
  const errors=[],bridge=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/providers\/invoke|127\.0\.0\.1:3691/.test(r.url()))bridge.push(r.url());});
  await page.goto("./");
  const {reportBytes,signature}=signedFixture();
  await page.getByLabel("Choose an offline ThinkTank kernel replay verification report (optional)")
    .setInputFiles(inputFile("report.json",reportBytes));
  await page.getByLabel("Choose a local ThinkTank detached signature JSON (optional)")
    .setInputFiles(inputFile("signature.json",signature));
  const signaturePanel=page.getByRole("region",{name:"ThinkTank detached signature cryptographic verification"});
  await expect(signaturePanel).toContainText("Signature valid · key trust not independently established");
  await page.getByRole("textbox",{name:/Trusted Ed25519 public-key SHA-256 fingerprint/})
    .fill(signature.publicKeyFingerprintSha256);
  await page.getByRole("checkbox",{name:/I independently obtained and checked/}).check();
  await expect(signaturePanel).toContainText("Signature valid · human key fingerprint matched");

  const journal=page.getByRole("region",{name:"Operator key-history journal"});
  await expect(journal).toContainText("0 tracked public keys");
  await page.getByLabel("Ed25519 SPKI SHA-256 fingerprint")
    .fill(signature.publicKeyFingerprintSha256);
  await page.getByLabel("Human-readable key label").fill("Workshop signer");
  await page.getByLabel("Where did you verify this fingerprint independently?")
    .fill("Checked against a separate offline key card.");
  await page.getByRole("checkbox",{name:/I independently checked this key fingerprint/}).check();
  await page.getByRole("button",{name:"Add reviewed key to this local journal"}).click();
  await expect(journal).toContainText("Workshop signer");
  await expect(journal).toContainText("ACTIVE");
  // History changes revoke previous consent, even when key is still active.
  await expect(signaturePanel).toContainText("key trust not independently established");

  await page.getByLabel("Select an active key").selectOption(signature.publicKeyFingerprintSha256);
  await page.getByLabel("Operator reason").fill("Suspected secret-key exposure.");
  await page.getByRole("checkbox",{name:/I understand this closes the selected key/}).check();
  await page.getByRole("button",{name:"Apply local key status change"}).click();
  await expect(journal).toContainText("REVOKED");
  await expect(page.getByRole("status")).toContainText("Local key-history journal updated");
  await page.getByRole("textbox",{name:/Trusted Ed25519 public-key SHA-256 fingerprint/})
    .fill(signature.publicKeyFingerprintSha256);
  await page.getByRole("checkbox",{name:/I independently obtained and checked/}).check();
  await expect(signaturePanel).toContainText("local key history blocks current trust");
  await expect(signaturePanel).toContainText("VALID");
  await expect(signaturePanel).toContainText("NOT CONFIRMED");
  await page.getByRole("button",{name:"Clear all local review data"}).click();
  await expect(journal).toContainText("0 tracked public keys");
  expect(errors).toEqual([]);
  expect(bridge).toEqual([]);
});

test("R10 unsigned export/import preserves closure notes but never restores a fingerprint pin",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto("./");
  const A="a".repeat(64),B="b".repeat(64);
  await page.getByLabel("Ed25519 SPKI SHA-256 fingerprint").fill(A);
  await page.getByLabel("Human-readable key label").fill("Key Alpha");
  await page.getByLabel("Where did you verify this fingerprint independently?").fill("Separate offline trusted card");
  await page.getByRole("checkbox",{name:/I independently checked this key fingerprint/}).check();
  await page.getByRole("button",{name:"Add reviewed key to this local journal"}).click();

  await page.getByLabel("Select an active key").selectOption(A);
  await page.getByLabel("Transition").selectOption("RETIRE");
  await page.getByLabel("Operator reason").fill("Scheduled offline rotation.");
  await page.getByRole("checkbox",{name:/I understand this closes the selected key/}).check();
  await page.getByRole("button",{name:"Apply local key status change"}).click();

  await page.getByLabel("Ed25519 SPKI SHA-256 fingerprint").fill(B);
  await page.getByLabel("Human-readable key label").fill("Key Beta");
  await page.getByLabel("Where did you verify this fingerprint independently?").fill("Independent printed SPKI digest");
  await page.getByLabel("Replaces previously retired/revoked key").selectOption(A);
  await page.getByRole("checkbox",{name:/I independently checked this key fingerprint/}).check();
  await page.getByRole("button",{name:"Add reviewed key to this local journal"}).click();

  const [download]=await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button",{name:"Export unsigned key-history JSON ↓"}).click()
  ]);
  expect(download.suggestedFilename()).toBe("commons-local-key-history.json");
  const fs=await import("node:fs/promises");
  const json=JSON.parse(await fs.readFile(await download.path(),"utf8"));
  expect(json.events.map(e=>e.action)).toEqual(["ADD","RETIRE","ADD"]);
  expect(json.events[2].replaces).toBe(A);

  await page.reload();
  await expect(page.getByRole("region",{name:"Operator key-history journal"})).toContainText("0 tracked public keys");
  await page.getByRole("checkbox",{name:/I understand this is an unauthenticated file/}).check();
  await page.getByLabel("Import local unsigned key-history JSON")
    .setInputFiles(inputFile("history.json",json));
  const journal=page.getByRole("region",{name:"Operator key-history journal"});
  await expect(journal).toContainText("2 tracked public keys");
  await expect(journal).toContainText("RETIRED");
  await expect(journal).toContainText("ACTIVE");
  await expect(page.getByRole("status")).toContainText("Unsigned history imported");
  await expect(page.getByRole("button",{name:"Convene five seats"})).toBeVisible();
});
