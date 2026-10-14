import React, {useEffect,useMemo,useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {DoubleSide} from "three";
import {THIRD_LIGHT_ARRAY_V01 as spec,thirdLightState} from "./thirdLightArrayPlan.mjs";

/**
 * Virtual crown artwork ONLY. No hardware control, drones, physical projector,
 * live data, soundtrack, network or remote assets. Geometry remains bounded.
 */
export function ThirdLightArray({mode="beacon",reducedMotion=false}){
  const flame=useRef(null), corona=useRef(null), halo=useRef(null);
  const orbit=useRef(null), beamMaterial=useRef(null), flameMaterial=useRef(null), haloMaterial=useRef(null);
  const nodes=useMemo(()=>Array.from({length:spec.emitterCount},(_,i)=>{
    const theta=i*2*Math.PI/spec.emitterCount;
    return [Math.cos(theta)*2.3,2.1+Math.sin(theta*3)*0.10,Math.sin(theta)*2.3];
  }),[]);

  const apply = (t) => {
    const s=thirdLightState(t,{mode,reducedMotion});
    if(flame.current) flame.current.scale.setScalar(s.flameScale);
    if(corona.current) corona.current.scale.setScalar(s.coronaScale);
    if(halo.current) halo.current.rotation.z=s.haloRotation;
    if(orbit.current) orbit.current.rotation.y=s.orbitAngle;
    if(beamMaterial.current) beamMaterial.current.opacity=s.beamOpacity;
    if(flameMaterial.current) flameMaterial.current.opacity=s.flameOpacity;
    if(haloMaterial.current) haloMaterial.current.opacity=s.haloOpacity;
  };
  // Explicit reset when changing mode/reduced-motion, including demand-render environments.
  useEffect(()=>{apply(0);},[mode,reducedMotion]);
  useFrame(({clock})=>{if(!reducedMotion) apply(clock.getElapsedTime());});
  return <group name="third-light-array-v01" position={[0,12.45,0]}>
    {/* The original design specified nine crown projectors: illustrated only. */}
    <mesh position={[0,0.1,0]}>
      <cylinderGeometry args={[1.05,1.22,0.45,12]}/>
      <meshStandardMaterial color="#305574" metalness={0.52} roughness={0.36}/>
    </mesh>
    <group ref={orbit}>
      {nodes.map(([x,y,z],i)=><mesh key={i} position={[x,y,z]}>
        <sphereGeometry args={[0.13,8,6]}/>
        <meshBasicMaterial color={i%3===0?"#e2fbff":"#72baff"} toneMapped={false}/>
      </mesh>)}
    </group>
    {/* Core flame remains permanently lit even in the quiet/default beacon mode. */}
    <group ref={flame} position={[0,1.55,0]}>
      <mesh position={[0,0.05,0]}>
        <coneGeometry args={[0.79,3.5,9]}/>
        <meshBasicMaterial ref={flameMaterial} color={spec.flameColor}
          transparent opacity={0.73} depthWrite={false} toneMapped={false} side={DoubleSide}/>
      </mesh>
      <mesh position={[0,-0.28,0.03]}>
        <coneGeometry args={[0.40,2.1,9]}/>
        <meshBasicMaterial color="#e0faff" transparent opacity={0.87}
          depthWrite={false} toneMapped={false}/>
      </mesh>
      <mesh position={[0,-0.96,0]}>
        <sphereGeometry args={[0.83,12,8]}/>
        <meshBasicMaterial color="#48abfc" transparent opacity={0.32} depthWrite={false} toneMapped={false}/>
      </mesh>
    </group>
    {/* A *quiet* blue flame and occasional stronger SIGNAL mode, not a fireworks show. */}
    <group ref={corona}>
      <mesh position={[0,2.15,0]}>
        <torusGeometry args={[2.55,0.058,6,3]}/>
        <meshBasicMaterial ref={haloMaterial} color={spec.haloColor}
          transparent opacity={0.43} depthWrite={false} toneMapped={false} side={DoubleSide}/>
      </mesh>
      <mesh position={[0,2.15,0]} rotation={[0,0,Math.PI/3]}>
        <torusGeometry args={[1.83,0.035,6,3]}/>
        <meshBasicMaterial color="#b1eeff" transparent opacity={mode==="signal"?0.63:0.23}
          depthWrite={false} toneMapped={false}/>
      </mesh>
    </group>
    <group ref={halo}>
      <mesh position={[0,2.15,0]} rotation={[0,0,Math.PI/6]}>
        <torusGeometry args={[3.1,0.045,6,3]}/>
        <meshBasicMaterial color="#66acd9" transparent opacity={mode==="signal"?0.58:0.21}
          depthWrite={false} toneMapped={false}/>
      </mesh>
    </group>
    <mesh position={[0,4.9,0]}>
      <coneGeometry args={[0.42,7.2,9]}/>
      <meshBasicMaterial ref={beamMaterial} color="#65c6ff" transparent opacity={0.075}
        depthWrite={false} side={DoubleSide} toneMapped={false}/>
    </mesh>
  </group>;
}
