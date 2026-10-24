import test from "node:test";
import assert from "node:assert/strict";
import {
  TRUST_LEDGER_SCHEMA, TRUST_LEDGER_MAX_BYTES, TRUST_WARNINGS,
  newTrustLedger, inspectTrustLedger, trustRecords, statusOfTrustKey,
  addTrustKey, changeTrustKeyStatus, exportTrustLedger, importTrustLedger
} from "../src/operatorTrustLedger.mjs";

const A="a".repeat(64), B="b".repeat(64), C="c".repeat(64);
const add=(ledger,key,label="Operator signing key",replaces=null)=>addTrustKey(ledger,{
  fingerprint:key,label,sourceNote:"Checked out-of-band against separately stored local SPKI fingerprint.",
  independentlyChecked:true,replaces
});
const close=(ledger,key,action="REVOKE")=>changeTrustKeyStatus(ledger,{
  fingerprint:key,action,reason:"Operator closed this key after reviewing local evidence.",confirmed:true
});

test("R10 append-only journal preserves reviewed status transitions and explicit rotation",()=>{
  let journal=newTrustLedger();
  assert.equal(journal.schema,TRUST_LEDGER_SCHEMA);
  assert.ok(Object.isFrozen(journal)&&Object.isFrozen(journal.events));
  journal=add(journal,A);
  assert.equal(statusOfTrustKey(journal,A),"ACTIVE");
  assert.equal(statusOfTrustKey(journal,B),"UNKNOWN");
  journal=close(journal,A,"RETIRE");
  assert.equal(statusOfTrustKey(journal,A),"RETIRED");
  journal=add(journal,B,"Rotated key",A);
  assert.equal(statusOfTrustKey(journal,B),"ACTIVE");
  assert.equal(trustRecords(journal).find(r=>r.fingerprint===B).replaces,A);
  journal=close(journal,B,"REVOKE");
  assert.equal(statusOfTrustKey(journal,B),"REVOKED");
  assert.ok(Object.isFrozen(journal.events)&&journal.events.every(Object.isFrozen));
  assert.deepEqual(journal.events.map(e=>e.sequence),[1,2,3,4]);
  assert.deepEqual(journal.events.map(e=>e.action),["ADD","RETIRE","ADD","REVOKE"]);
  assert.equal(importTrustLedger(exportTrustLedger(journal)).events.length,4);
  assert.equal(statusOfTrustKey(importTrustLedger(exportTrustLedger(journal)),B),"REVOKED");
});

test("no reactivation, fake rotation, unsupported state, duplicate keys or skipped steps",()=>{
  const start=add(newTrustLedger(),A);
  assert.throws(()=>add(start,A),/twice/);
  assert.throws(()=>add(start,B,"Premature rotation",A),/previously retired/);
  const closed=close(start,A);
  assert.throws(()=>close(closed,A),/Only an active/);
  assert.throws(()=>add(closed,A),/twice/);
  assert.throws(()=>close(closed,C),/Unknown key/);
  assert.throws(()=>addTrustKey(closed,{fingerprint:B,label:"oops",sourceNote:"independent",independentlyChecked:false}),/acknowledgment/);
  assert.throws(()=>changeTrustKeyStatus(start,{fingerprint:A,action:"REVOKE",reason:"reason",confirmed:false}),/confirmation/);
  assert.throws(()=>changeTrustKeyStatus(start,{fingerprint:A,action:"ACTIVATE",reason:"reason",confirmed:true}),/confirmation/);
  assert.throws(()=>addTrustKey(start,{fingerprint:"not sha",label:"bad",sourceNote:"a note",independentlyChecked:true}),/64 lowercase/);
});

test("malicious or edited journal cannot invent authorities or bypass replay invariants",()=>{
  const base=add(newTrustLedger(),A);
  const document=JSON.parse(exportTrustLedger(base));
  assert.throws(()=>inspectTrustLedger({...document,authGranted:true}),/Invalid or oversized/);
  assert.throws(()=>inspectTrustLedger({...document,events:[{...document.events[0],authGranted:true}]}),/Malformed/);
  assert.throws(()=>inspectTrustLedger({...document,events:[{...document.events[0],sequence:999}]}),/out-of-order/);
  assert.throws(()=>inspectTrustLedger({...document,events:[{...document.events[0],action:"TRUST_REMOTE"}]}),/Malformed/);
  assert.throws(()=>inspectTrustLedger({...document,events:[
    ...document.events,{...document.events[0],sequence:2}
  ]}),/twice/);
  assert.throws(()=>inspectTrustLedger({...document,events:[
    ...document.events,{sequence:2,action:"REVOKE",fingerprint:A,label:"Wrong label",sourceNote:"changed",replaces:null}
  ]}),/Only an active/);
  assert.throws(()=>importTrustLedger("{"),/Invalid operator/);
  assert.throws(()=>importTrustLedger("x".repeat(TRUST_LEDGER_MAX_BYTES+1)),/at most 64 KiB/);
  assert.throws(()=>importTrustLedger(""),/nonempty/);
  assert.match(TRUST_WARNINGS.portability,/unsigned/i);
  assert.match(TRUST_WARNINGS.imported,/not verified provenance/i);
});

test("key status journal has NO global identity, expiration assertion, signing powers or automatic pins",()=>{
  const history=add(newTrustLedger(),C);
  const wire=exportTrustLedger(history);
  assert.doesNotMatch(wire,/privateKey|signatureBase64|trustedIdentity|authorityGranted|localStorage|issuedAt/i);
  assert.equal(statusOfTrustKey(history,C),"ACTIVE");
  assert.equal(statusOfTrustKey(close(history,C,"RETIRE"),C),"RETIRED");
});
