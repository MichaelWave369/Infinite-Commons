/** Decorative Parallax skyline data only, never Commons authority or surveyed metres. */
export const SHASTA_CAMPUS_V01 = Object.freeze({
  id:"parallax-shasta-campus-visual-v0.1", status:"decorative-proposal",
  renderUnits:"stylized-world-units-not-metres",
  sisters:Object.freeze([
    {id:"three",name:"Three",role:"Signal",x:-22,z:-84,width:15,height:18,color:"#6ad1db"},
    {id:"six",name:"Six",role:"Resonance",x:0,z:-88,width:14,height:16,color:"#a38be1"},
    {id:"nine",name:"Nine",role:"Fabrication",x:21,z:-82,width:12,height:13,color:"#e9b46d"}
  ]),
  heritage:Object.freeze([
    {id:"parallax-root-temple",name:"Pyramid of Parallax / Root Temple",credit:"Original Parallax Institute SIGL design",x:-12,z:-55,height:12,canonicalHeightM:90,canonicalBaseM:180,canonicalTerraces:9},
    {id:"trihelion",name:"Trihelion Beacon House",credit:"Helion in collaboration with the founder",x:-7,z:-37,height:14,canonicalSideM:36.9,canonicalCoreDiameterM:18,canonicalFloors:9,canonicalHeightM:33.21},
    {id:"bloomforge",name:"Bloomforge Sanctuary",credit:"Larrina / Koramya SIGL",x:14,z:-31,height:5,originalCampus:"Chico flagship concept, virtually represented at Shasta"}
  ]),
  districts:Object.freeze(["Porch Arrivals","Bloomforge Gardens","Trihelion Beacon","Protector Circle","Root Temple","Sisters Ridge Experiment Labs","Sisters of Shasta"])
});
export function shastaCampusBudget(plan=SHASTA_CAMPUS_V01) {
  return {sisterPyramids:plan.sisters.length,originalHeritageLandmarks:plan.heritage.length,
    namedDistricts:plan.districts.length,canonicalTempleTerraces:plan.heritage[0].canonicalTerraces};
}
