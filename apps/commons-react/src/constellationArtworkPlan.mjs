/**
 * Authored, stylized constellation art for the Third Light Array.
 * Inspired by Orion's Belt but NOT an ephemeris, precise 3D sky map,
 * Egyptian astronomy proof, or physically projected aerial image.
 * World units below are illustrative relative to Trihelion's crown.
 */
export const THIRD_LIGHT_CONSTELLATION_V02 = Object.freeze({
  id:"third-light-constellation-v0.2",
  origin:"FICTIONAL_VISUAL_SIMULATION",
  label:"Orion-inspired three-star illustration",
  stars:Object.freeze([
    Object.freeze({id:"first",x:-7,y:13.4,z:0.2}),
    Object.freeze({id:"second",x:0,y:14.7,z:0.2}),
    Object.freeze({id:"third",x:7,y:16.4,z:0.2})
  ]),
  links:Object.freeze([[0,1],[1,2]].map(pair=>Object.freeze(pair))),
  starSystemClaim:false,
  astronomicallyCalibrated:false,
  claimsHistoricalAlignment:false,
  usesNetworkAssets:false,
  controlsRealProjection:false
});
export function constellationBudget(spec=THIRD_LIGHT_CONSTELLATION_V02){
  return {stars:spec.stars.length,segments:spec.links.length};
}
