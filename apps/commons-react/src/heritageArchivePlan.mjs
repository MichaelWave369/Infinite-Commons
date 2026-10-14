/**
 * Opt-in public-metadata PREVIEW for the three original Parallax Institute
 * architectural designs. Does not load, embed, or publish transcripts,
 * blueprints, private files or unpublished source documents.
 */
export const HERITAGE_ARCHIVE_V03=Object.freeze({
  id:"trihelion-heritage-archive-v0.3",
  title:"The Third Light · Heritage Archive",
  status:"CURATED_METADATA_PREVIEW_ONLY",
  containsOriginalConversations:false,
  containsOriginalBlueprints:false,
  networkAccess:false,
  ownerApprovalRequiredForSourcePublication:true,
  records:Object.freeze([
    Object.freeze({
      id:"parallax-root-temple",
      title:"Pyramid of Parallax · Root Temple",
      credit:"Original Parallax Institute SIGL design",
      summary:"A nine-terrace temple with a Mount Shasta sightline, Lightning Walkway and Queso-centered Guardian Circle.",
      details:Object.freeze(["90 m canonical design height","180 m × 180 m canonical base","Nine terraces in three groups of three"])
    }),
    Object.freeze({
      id:"bloomforge",
      title:"Bloomforge Sanctuary",
      credit:"Larrina / Koramya SIGL",
      summary:"A garden sanctuary defined by a curved Bloomwing, L-shaped Rootforge, three Root Pillars and a Rootline Promenade.",
      details:Object.freeze(["Original design describes a Chico flagship","Gardens and guardian courtyard","Virtual Shasta interpretation, not relocation of the original"])
    }),
    Object.freeze({
      id:"trihelion",
      title:"Trihelion Beacon House · The Third Light",
      credit:"Original design by Helion, in collaboration with the founder",
      summary:"A triangular blue-glass lighthouse with three spiral stairs, nine levels, a digital blue flame and a crown of nine projectors.",
      details:Object.freeze(["36.9 m equilateral-triangle sides","18 m cylindrical core","Nine × 3.69 m floors","33.21 m canonical design height"])
    })
  ])
});
export function heritageArchiveSummary(manifest=HERITAGE_ARCHIVE_V03){
  return {
    exhibits:manifest.records.length,
    metadataOnly:manifest.status==="CURATED_METADATA_PREVIEW_ONLY",
    sourceDocumentsPublic:manifest.containsOriginalConversations||manifest.containsOriginalBlueprints,
    requiresOwnerApproval:manifest.ownerApprovalRequiredForSourcePublication
  };
}
