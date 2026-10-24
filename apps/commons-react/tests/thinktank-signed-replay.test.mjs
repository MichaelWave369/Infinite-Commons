import test from "node:test";
import assert from "node:assert/strict";
import {createHash,generateKeyPairSync,sign,webcrypto} from "node:crypto";
import {
  LOCAL_SIGNED_REPLAY_SCHEMA, LOCAL_SIGNED_REPLAY_VERSION, LOCAL_SIGNED_REPLAY_DOMAIN,
  LOCAL_SIGNATURE_MAX_BYTES,parseLocalReplaySignature,verifyLocalReplaySignature
} from "../src/thinkTankSignedReplay.mjs";
const hex=bytes=>createHash("sha256").update(bytes).digest("hex");
function sample(reportBytes=Buffer.from('{"result":"KERNEL_REPLAY_PASS"}')){
 const {privateKey,publicKey}=generateKeyPairSync("ed25519");
 const spki=publicKey.export({format:"der",type:"spki"});
 const reportSha256=hex(reportBytes);
 return {
  schema:LOCAL_SIGNED_REPLAY_SCHEMA,domain:LOCAL_SIGNED_REPLAY_DOMAIN,
  algorithm:"Ed25519",messageEncoding:"utf8-domain-plus-sha256-hex",
  reportSha256,publicKeySpkiBase64:spki.toString("base64"),
  publicKeyFingerprintSha256:hex(spki),
  signatureBase64:sign(null,Buffer.from(LOCAL_SIGNED_REPLAY_DOMAIN+"\n"+reportSha256),privateKey).toString("base64"),
  signerLabel:"operator-selected-local-key",authGranted:false,externalDone:false,truthAuthority:false,signerAuthenticated:false
 };
}
test("R9 verifies a real Ed25519 signature with exact report hash, and distinguishes an operator key pin",async()=>{
 assert.equal(LOCAL_SIGNED_REPLAY_VERSION,"commons.ed25519-replay-trust.review-v0.9");
 const record=parseLocalReplaySignature(JSON.stringify(sample()));
 const missingPin=await verifyLocalReplaySignature(record,record.reportSha256,"",false,webcrypto.subtle);
 assert.equal(missingPin.signatureValid,true);
 assert.equal(missingPin.reportBytesMatch,true);
 assert.equal(missingPin.fingerprintClaimMatches,true);
 assert.equal(missingPin.mathematicallyBound,true);
 assert.equal(missingPin.locallyPinned,false);
 const pinned=await verifyLocalReplaySignature(record,record.reportSha256,record.publicKeyFingerprintSha256,true,webcrypto.subtle);
 assert.equal(pinned.locallyPinned,true);
 assert.match(pinned.status,/NO INDEPENDENT IDENTITY/);
 const unconfirmed=await verifyLocalReplaySignature(record,record.reportSha256,record.publicKeyFingerprintSha256,false,webcrypto.subtle);
 assert.equal(unconfirmed.locallyPinned,false);
});
test("tampering any signed bytes, report digest or the explicit key pin fails",async()=>{
 const record=parseLocalReplaySignature(JSON.stringify(sample()));
 const alteredReport=await verifyLocalReplaySignature(record,hex("modified local report"),record.publicKeyFingerprintSha256,true,webcrypto.subtle);
 assert.equal(alteredReport.reportBytesMatch,false);
 assert.equal(alteredReport.locallyPinned,false);
 const wrongPin=await verifyLocalReplaySignature(record,record.reportSha256,"f".repeat(64),true,webcrypto.subtle);
 assert.equal(wrongPin.pinnedKeyMatch,false);
 const badSig={...record,signatureBase64:Buffer.alloc(64,0x42).toString("base64")};
 const invalid=await verifyLocalReplaySignature(badSig,record.reportSha256,record.publicKeyFingerprintSha256,true,webcrypto.subtle);
 assert.equal(invalid.signatureValid,false);
 assert.equal(invalid.mathematicallyBound,false);
});
test("strict malformed or authority-elevating signature records fail closed",()=>{
 const base=sample();
 assert.throws(()=>parseLocalReplaySignature(""),/Choose/);
 assert.throws(()=>parseLocalReplaySignature("{"),/Invalid signed/);
 assert.throws(()=>parseLocalReplaySignature("x".repeat(LOCAL_SIGNATURE_MAX_BYTES+1)),/32 KiB/);
 for(const change of [
  {schema:"fake"},{algorithm:"RSA-PSS"},{reportSha256:"0".repeat(63)},
  {authGranted:true},{externalDone:true},{truthAuthority:true},{signerAuthenticated:true},
  {domain:"NO_DOMAIN"},{publicKeySpkiBase64:"AAAA"},{signatureBase64:"AAAA"},
  {signerLabel:"remote-verified-identity"},{newAuthority:"true"}
 ])assert.throws(()=>parseLocalReplaySignature(JSON.stringify({...base,...change})));
});
