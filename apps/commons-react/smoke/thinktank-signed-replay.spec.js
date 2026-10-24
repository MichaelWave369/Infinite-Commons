import {test,expect} from "@playwright/test";
import {createHash,generateKeyPairSync,sign} from "node:crypto";
const sha=bytes=>createHash("sha256").update(bytes).digest("hex");
const asFile=(name,value)=>({name,mimeType:"application/json",buffer:Buffer.from(value)});
function fixture(){
 const report={
  schema:"phi-thinktank-local-council-verification.v0.1",
  execution:"LOCAL_KERNEL_REPLAY_ONLY",result:"KERNEL_REPLAY_PASS",
  replayKernel:"think-tank/src/kernel/eventKernel.ts",
  ledgerSha256:"a".repeat(64),dossierSha256:null,contractSha256:"b".repeat(64),
  finalFingerprint:"fnv1a32:01234567",mode:"audit",model:"gemma3:12b",
  sessionId:"PHI-0001",eventCount:1,providerTurnCount:0,dossierId:null,
  dossierMatch:"NOT_SUPPLIED",authGranted:false,externalDone:false,
  truthAuthority:false,signerAuthenticated:false,independentlyAuthenticated:false,
  verifierOrigin:"local-operator-computer",localClockTrust:"untrusted-local-clock"
 };
 const reportBytes=Buffer.from(JSON.stringify(report),"utf8");
 const {privateKey,publicKey}=generateKeyPairSync("ed25519");
 const spki=publicKey.export({format:"der",type:"spki"});
 const reportSha=sha(reportBytes);
 const signature={
  schema:"phi-thinktank-local-replay-signature.v0.1",
  domain:"PHI_THINKTANK_LOCAL_REPLAY_SIGNATURE_V1",algorithm:"Ed25519",
  messageEncoding:"utf8-domain-plus-sha256-hex",reportSha256:reportSha,
  publicKeySpkiBase64:spki.toString("base64"),
  publicKeyFingerprintSha256:sha(spki),
  signatureBase64:sign(null,Buffer.from("PHI_THINKTANK_LOCAL_REPLAY_SIGNATURE_V1\n"+reportSha),privateKey).toString("base64"),
  signerLabel:"operator-selected-local-key",
  authGranted:false,externalDone:false,truthAuthority:false,signerAuthenticated:false
 };
 return {reportBytes,signature};
}
test("R9 WebCrypto validates detached local Ed25519 signature, distinguishes key trust, detects a different report",async({page})=>{
 const errors=[],providerRequests=[];
 page.on("pageerror",err=>errors.push(err.message));
 page.on("request",req=>{if(/providers\/invoke|127\.0\.0\.1:3691/.test(req.url()))providerRequests.push(req.url());});
 await page.goto("./");
 await page.getByRole("link",{name:/RETURN DESK/}).click();
 const {reportBytes,signature}=fixture();
 await page.getByLabel("Choose an offline ThinkTank kernel replay verification report (optional)")
   .setInputFiles(asFile("replay.json",reportBytes));
 await page.getByLabel("Choose a local ThinkTank detached signature JSON (optional)")
   .setInputFiles(asFile("replay.sig.json",JSON.stringify(signature)));
 const panel=page.getByRole("region",{name:"ThinkTank detached signature cryptographic verification"});
 await expect(panel).toContainText("Signature valid · key trust not independently established");
 await expect(panel).toContainText("VALID");
 await expect(panel).toContainText("NOT CONFIRMED");
 await page.getByRole("textbox",{name:/Trusted Ed25519 public-key SHA-256 fingerprint/})
   .fill(signature.publicKeyFingerprintSha256);
 await page.getByRole("checkbox",{name:/I independently obtained and checked/}).check();
 await expect(panel).toContainText("Signature valid · human key fingerprint matched");
 await expect(panel).toContainText("MATCH (USER-ASSERTED)");
 const altered=Buffer.from(JSON.stringify({...JSON.parse(reportBytes.toString()),model:"altered:1"}));
 await page.getByLabel("Choose an offline ThinkTank kernel replay verification report (optional)")
   .setInputFiles(asFile("changed-report.json",altered));
 await expect(panel).toContainText("Signature not fully valid for this report");
 await expect(panel).toContainText("MISMATCH");
 await page.getByRole("button",{name:"Clear all local review data"}).click();
 await expect(page.getByRole("region",{name:"ThinkTank detached signature cryptographic verification"})).toHaveCount(0);
 expect(errors).toEqual([]);
 expect(providerRequests).toEqual([]);
});
test("R9 refuses signature authority escalation on mobile, preserving five-seat STATION",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("./");
 const {signature}=fixture();
 await page.getByLabel("Choose a local ThinkTank detached signature JSON (optional)")
   .setInputFiles(asFile("forged.json",JSON.stringify({...signature,authGranted:true})));
 await expect(page.getByRole("alert")).toContainText("authority-elevating");
 await expect(page.getByRole("region",{name:"ThinkTank detached signature cryptographic verification"})).toHaveCount(0);
 await expect(page.getByRole("button",{name:"Convene five seats"})).toBeVisible();
});
