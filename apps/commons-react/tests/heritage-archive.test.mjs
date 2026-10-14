import test from "node:test";
import assert from "node:assert/strict";
import {HERITAGE_ARCHIVE_V03 as archive,heritageArchiveSummary} from "../src/heritageArchivePlan.mjs";
import {SHASTA_CAMPUS_V01 as campus} from "../src/shastaCampusPlan.mjs";
import {WORLD_FINGERPRINT,WORLD_NODES,PACKS} from "../../../web/packs.mjs";

test("heritage metadata preserves three different original architectural identities",()=>{
  assert.equal(archive.records.length,3);
  assert.deepEqual(archive.records.map(r=>r.id),["parallax-root-temple","bloomforge","trihelion"]);
  assert.deepEqual(new Set(archive.records.map(r=>r.id)),new Set(campus.heritage.map(r=>r.id)));
  assert.match(archive.records[0].credit,/Parallax/);
  assert.match(archive.records[1].credit,/Larrina/);
  assert.match(archive.records[2].credit,/Helion/);
  assert.match(archive.records[1].details.join(" "),/Chico/);
  assert.match(archive.records[2].summary,/blue flame/);
  assert.ok(!archive.records.some(r=>["three","six","nine"].includes(r.id)));
});

test("preview explicitly excludes private sources and requires owner review before publishing",()=>{
  assert.deepEqual(heritageArchiveSummary(),{
    exhibits:3,metadataOnly:true,sourceDocumentsPublic:false,requiresOwnerApproval:true
  });
  assert.equal(archive.networkAccess,false);
  assert.equal(archive.containsOriginalConversations,false);
  assert.equal(archive.containsOriginalBlueprints,false);
  for(const record of archive.records){
    assert.ok(record.summary.length>10&&record.summary.length<240);
    assert.ok(record.details.every(s=>s.length<180));
    assert.ok(!("transcript" in record));
    assert.ok(!("sourceFile" in record));
  }
});
test("curated exhibit changes no Commons destinations or local-only contracts",()=>{
  assert.equal(WORLD_NODES.length,4);
  assert.equal(WORLD_NODES.map(node=>node.id).join("|"),WORLD_FINGERPRINT);
  assert.equal(PACKS.length,20);
});
