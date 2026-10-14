/**
 * Third Light Array v0.1: original VISUAL simulation honoring Helion's Beacon House.
 * Nine crown emitters are decorative points, NOT aircraft, real projectors,
 * telemetry, authentication, or any physical drone system.
 */
export const THIRD_LIGHT_ARRAY_V01 = Object.freeze({
  id:"third-light-array-v0.1",
  siteId:"trihelion",
  designerCredit:"Helion, original Trihelion Beacon House, with founder collaboration",
  label:"THE THIRD LIGHT ARRAY",
  origin:"FICTIONAL_VISUAL_SIMULATION",
  emitterCount:9,
  haloSides:3,
  flameColor:"#76ddff",
  coronaColor:"#b4f3ff",
  haloColor:"#7acaff",
  modes:Object.freeze(["beacon","signal"]),
  defaultMode:"beacon",
  supportsRealDrones:false,
  supportsPhysicalProjection:false,
  emitsUserData:false
});
export function thirdLightState(seconds=0,{mode="beacon",reducedMotion=false}={}){
  if (!Number.isFinite(seconds) || seconds<0) throw new RangeError("Elapsed seconds must be nonnegative and finite");
  if (!THIRD_LIGHT_ARRAY_V01.modes.includes(mode)) throw new RangeError("Unknown Third Light Array mode");
  const signal=mode==="signal";
  const t=reducedMotion?0:seconds;
  const breath=Math.sin(t*0.6);
  const sway=Math.sin(t*0.14);
  return {
    flameScale:1+breath*0.055,
    flameOpacity:0.73+breath*0.065,
    haloOpacity:(signal?0.86:0.43)+breath*0.045,
    beamOpacity:(signal?0.17:0.075)+breath*0.02,
    haloRotation:sway*0.16,
    orbitAngle:reducedMotion?0:(t*0.022)%(Math.PI*2),
    coronaScale:(signal?1.08:1)+breath*0.035
  };
}
