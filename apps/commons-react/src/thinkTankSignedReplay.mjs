/**
 * R9: strict detached Ed25519 signature verification over an R8 replay
 * report's exact SHA-256 bytes. No auto-trust. A public key embedded in a
 * signature file authenticates NOTHING until independently pinned by a human.
 */
export const LOCAL_SIGNED_REPLAY_SCHEMA="phi-thinktank-local-replay-signature.v0.1";
export const LOCAL_SIGNED_REPLAY_VERSION="commons.ed25519-replay-trust.review-v0.9";
export const LOCAL_SIGNED_REPLAY_DOMAIN="PHI_THINKTANK_LOCAL_REPLAY_SIGNATURE_V1";
export const LOCAL_SIGNATURE_MAX_BYTES=32*1024;
const HEX=/^[a-f0-9]{64}$/;
const FIELDS=Object.freeze([
  "schema","domain","algorithm","messageEncoding","reportSha256",
  "publicKeySpkiBase64","publicKeyFingerprintSha256","signatureBase64",
  "signerLabel","authGranted","externalDone","truthAuthority","signerAuthenticated"
]);
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function decodeStrictBase64(value,size){
  if(typeof value!=="string"||value.length===0||value.length>2048||
     value.length%4!==0||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value))
    throw Error("Invalid signature/public-key base64 encoding.");
  const binary=atob(value);
  if(binary.length!==size)throw Error("Unexpected Ed25519 key/signature byte length.");
  const bytes=Uint8Array.from(binary,character=>character.charCodeAt(0));
  // SPKI public keys are 44 bytes, raw Ed25519 signatures are 64 bytes.
  if(size===44){
    const expected=[0x30,0x2a,0x30,0x05,0x06,0x03,0x2b,0x65,0x70,0x03,0x21,0x00];
    if(!expected.every((byte,i)=>bytes[i]===byte))throw Error("Expected an Ed25519 SPKI public key.");
  }
  return bytes;
}
export function parseLocalReplaySignature(content){
  if(typeof content!=="string"||!content.trim()||
     new TextEncoder().encode(content).byteLength>LOCAL_SIGNATURE_MAX_BYTES)
    throw Error("Choose a local signature JSON file below 32 KiB.");
  let record;
  try{record=JSON.parse(content)}catch{throw Error("Invalid signed-replay JSON file.");}
  if(!plain(record)||Object.keys(record).sort().join("|")!==[...FIELDS].sort().join("|")||
     record.schema!==LOCAL_SIGNED_REPLAY_SCHEMA||record.domain!==LOCAL_SIGNED_REPLAY_DOMAIN||
     record.algorithm!=="Ed25519"||record.messageEncoding!=="utf8-domain-plus-sha256-hex"||
     record.signerLabel!=="operator-selected-local-key"||
     !HEX.test(record.reportSha256)||!HEX.test(record.publicKeyFingerprintSha256)||
     record.authGranted!==false||record.externalDone!==false||
     record.truthAuthority!==false||record.signerAuthenticated!==false)
    throw Error("Unsupported, malformed or authority-elevating detached signature.");
  decodeStrictBase64(record.publicKeySpkiBase64,44);
  decodeStrictBase64(record.signatureBase64,64);
  return Object.freeze(record);
}

export async function verifyLocalReplaySignature(signature,exactReportSha256,operatorPin="",confirmed=false,subtle=globalThis.crypto?.subtle){
  if(!signature||signature.schema!==LOCAL_SIGNED_REPLAY_SCHEMA)throw Error("No reviewed Ed25519 signature.");
  if(!subtle)throw Error("Browser cryptographic verification is unavailable.");
  const keyDer=decodeStrictBase64(signature.publicKeySpkiBase64,44);
  const sigBytes=decodeStrictBase64(signature.signatureBase64,64);
  const fingerprintBytes=await subtle.digest("SHA-256",keyDer);
  const actualFingerprint=Array.from(new Uint8Array(fingerprintBytes),b=>b.toString(16).padStart(2,"0")).join("");
  const fingerprintClaimMatches=signature.publicKeyFingerprintSha256===actualFingerprint;
  const reportBytesMatch=Boolean(HEX.test(exactReportSha256??"")&&
    signature.reportSha256===exactReportSha256);
  let valid=false;
  try {
    const key=await subtle.importKey("spki",keyDer,{name:"Ed25519"},false,["verify"]);
    const message=new TextEncoder().encode(LOCAL_SIGNED_REPLAY_DOMAIN+"\n"+signature.reportSha256);
    valid=await subtle.verify("Ed25519",key,sigBytes,message);
  } catch { valid=false; }
  const pinnedKeyMatch=Boolean(confirmed&&HEX.test(operatorPin.trim().toLowerCase())&&
    operatorPin.trim().toLowerCase()===actualFingerprint);
  return Object.freeze({
    signatureValid:Boolean(valid),
    fingerprintClaimMatches,
    reportBytesMatch,
    pinnedKeyMatch,
    mathematicallyBound:Boolean(valid&&fingerprintClaimMatches&&reportBytesMatch),
    locallyPinned:Boolean(valid&&fingerprintClaimMatches&&reportBytesMatch&&pinnedKeyMatch),
    actualKeyFingerprint:actualFingerprint,
    status:"CRYPTOGRAPHIC KEY POSSESSION CHECK ONLY · NO INDEPENDENT IDENTITY, REPLAY, TRUTH OR ACTION AUTHORITY"
  });
}
