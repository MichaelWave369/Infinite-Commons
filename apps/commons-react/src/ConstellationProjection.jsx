import React, {useMemo} from "react";
import {Quaternion,Vector3} from "three";
import {THIRD_LIGHT_CONSTELLATION_V02 as spec} from "./constellationArtworkPlan.mjs";

/** Static, deterministic Three.js artwork. No real telescope feed or drones. */
function Connection({start,end}){
  const {length,mid,rotation}=useMemo(()=>{
    const a=new Vector3(start.x,start.y,start.z),b=new Vector3(end.x,end.y,end.z);
    const direction=b.clone().sub(a);
    return {
      length:direction.length(),
      mid:a.clone().add(b).multiplyScalar(0.5),
      rotation:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.normalize())
    };
  },[start,end]);
  return <mesh position={mid} quaternion={rotation}>
    <cylinderGeometry args={[0.055,0.055,length,6]}/>
    <meshBasicMaterial color="#a6ebff" transparent opacity={0.68}
      toneMapped={false} depthWrite={false} fog={false}/>
  </mesh>;
}

export function ConstellationProjection(){
  return <group name="third-light-constellation-v02" position={[0,0.35,0]}>
    {/* One delicate vertical connection to the crown. */}
    <mesh position={[0,7.4,0]}>
      <coneGeometry args={[0.55,13.6,8]}/>
      <meshBasicMaterial color="#6cbbf4" transparent opacity={0.045}
        depthWrite={false} toneMapped={false} fog={false}/>
    </mesh>
    {spec.links.map(([a,b],i)=><Connection key={i} start={spec.stars[a]} end={spec.stars[b]}/>)}
    {spec.stars.map(star=><group key={star.id} position={[star.x,star.y,star.z]}>
      <mesh><sphereGeometry args={[0.55,12,8]}/>
        <meshBasicMaterial color="#e6fbff" toneMapped={false} fog={false}/></mesh>
      <mesh><sphereGeometry args={[1.38,12,8]}/>
        <meshBasicMaterial color="#75c7ff" transparent opacity={0.17}
          depthWrite={false} toneMapped={false} fog={false}/></mesh>
      <mesh rotation={[0,0,Math.PI/4]}>
        <planeGeometry args={[0.12,2.3]}/>
        <meshBasicMaterial color="#c1e9ff" transparent opacity={0.60}
          depthWrite={false} side={2} toneMapped={false} fog={false}/>
      </mesh>
    </group>)}
  </group>;
}
