import React, {useMemo} from "react";
import {Shape, DoubleSide} from "three";
import {SHASTA_CAMPUS_V01 as campus} from "./shastaCampusPlan.mjs";
import {ThirdLightArray} from "./ThirdLightArray.jsx";

// Original low-poly, visual-only skyline proxies; no actual locations or model/Porch connections.
const BASE=-7;
function asShape(points){
  const s=new Shape();
  points.forEach(([x,y],i)=>i===0?s.moveTo(x,y):s.lineTo(x,y));
  s.closePath(); return s;
}
function Mountain(){
  const shapes=useMemo(()=>({
    mass:asShape([[-100,-19],[-100,7],[-75,19],[-54,11],[-35,22],[-18,15],[-8,29],[0,43],[9,30],[21,26],[42,12],[71,19],[103,4],[103,-19]]),
    snow:asShape([[-15,26],[-8,29],[0,43],[9,30],[21,26],[12,31],[5,27],[0,33],[-7,26]]),
    ridge:asShape([[-106,-19],[-106,-7],[-69,-2],[-48,-7],[-28,2],[-10,-4],[16,0],[37,-6],[75,-1],[106,-8],[106,-19]])
  }),[]);
  return <group>
    <mesh position={[0,0,-116]}><shapeGeometry args={[shapes.mass]}/><meshBasicMaterial color="#53668a" side={DoubleSide} fog={false} toneMapped={false}/></mesh>
    <mesh position={[0,0,-115.6]}><shapeGeometry args={[shapes.snow]}/><meshBasicMaterial color="#d0d5e7" side={DoubleSide} fog={false} toneMapped={false}/></mesh>
    <mesh position={[0,0,-108]}><shapeGeometry args={[shapes.ridge]}/><meshBasicMaterial color="#243954" side={DoubleSide} fog={false} toneMapped={false}/></mesh>
  </group>;
}
function Sister({site}){
  return <group position={[site.x,BASE,site.z]}>
    <mesh position={[0,site.height/2,0]} rotation={[0,Math.PI/4,0]}>
      <coneGeometry args={[site.width/Math.SQRT2,site.height,4]}/>
      <meshStandardMaterial color={site.color} emissive={site.color} emissiveIntensity={0.13} roughness={0.83} flatShading/>
    </mesh>
    <mesh position={[0,0.15,0]}><boxGeometry args={[site.width*1.1,0.3,site.width*1.1]}/><meshStandardMaterial color="#344052" roughness={1}/></mesh>
    <mesh position={[0,0.32,site.width*0.54]}><boxGeometry args={[site.width*0.8,0.07,0.14]}/><meshBasicMaterial color={site.color} toneMapped={false}/></mesh>
  </group>;
}
function RootTemple(){
  const site=campus.heritage[0];
  return <group position={[site.x,BASE,site.z]}>
    {Array.from({length:9},(_,i)=><mesh key={i} position={[0,0.54+i*1.17,0]}>
      <boxGeometry args={[13.7-i*1.18,1.1,13.7-i*1.18]}/>
      <meshStandardMaterial color={i>5?"#d8c9b5":i%2?"#81776f":"#9d9080"} roughness={0.94}/>
    </mesh>)}
    <mesh position={[0,11.15,0]}><cylinderGeometry args={[0.7,0.7,0.3,12]}/><meshBasicMaterial color="#e5c996" toneMapped={false}/></mesh>
  </group>;
}
function Trihelion({reducedMotion=false,arrayMode="beacon"}){
  const site=campus.heritage[1];
  return <group position={[site.x,BASE,site.z]}>
    <mesh position={[0,6.1,0]} rotation={[0,Math.PI/6,0]}>
      <cylinderGeometry args={[2.8,2.8,12.2,3]}/>
      <meshStandardMaterial color="#4387b8" metalness={0.38} roughness={0.29} transparent opacity={0.85}/>
    </mesh>
    <mesh position={[0,6.1,0]}><cylinderGeometry args={[1.4,1.4,12.3,18]}/><meshStandardMaterial color="#a5e1fa" transparent opacity={0.32} roughness={0.23}/></mesh>
    {Array.from({length:9},(_,i)=><mesh key={i} position={[0,0.7+i*1.34,0]} rotation={[0,Math.PI/6,0]}>
      <cylinderGeometry args={[2.85,2.85,0.09,3]}/><meshBasicMaterial color="#90c8ed" toneMapped={false}/>
    </mesh>)}
    <ThirdLightArray mode={arrayMode} reducedMotion={reducedMotion}/>
  </group>;
}
function Bloomforge(){
  const site=campus.heritage[2];
  return <group position={[site.x,BASE,site.z]}>
    {Array.from({length:9},(_,i)=>{
      const t=Math.PI*(0.15+0.7*i/8);
      return <mesh key={i} position={[Math.cos(t)*5.9,2.6,Math.sin(t)*3.4-0.7]} rotation={[0,-t,0]}>
        <boxGeometry args={[2.15,5.2,1]}/><meshStandardMaterial color={i%2?"#5c917b":"#77ac8e"} roughness={0.87}/>
      </mesh>;
    })}
    <mesh position={[-1,1.6,5.4]}><boxGeometry args={[7,3.2,1.6]}/><meshStandardMaterial color="#947b70"/></mesh>
    <mesh position={[-4,1.6,7.6]}><boxGeometry args={[1.6,3.2,5.3]}/><meshStandardMaterial color="#947b70"/></mesh>
    {[-4,0,4].map((x,i)=><mesh key={i} position={[x,1,2.6]}>
      <cylinderGeometry args={[0.55,0.68,2,6]}/><meshStandardMaterial color="#c6a76a"/>
    </mesh>)}
    <mesh position={[0,0.11,2.5]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[2.5,24]}/><meshBasicMaterial color="#446d65" toneMapped={false}/></mesh>
    <mesh position={[0,1,2.5]}><sphereGeometry args={[0.46,10,8]}/><meshStandardMaterial color="#f0d4ac"/></mesh>
  </group>;
}
function Trace({a,b,blue=false}){
  const dx=b[0]-a[0],dz=b[1]-a[1];
  return <mesh position={[(a[0]+b[0])/2,BASE+0.12,(a[1]+b[1])/2]} rotation={[0,-Math.atan2(dz,dx),0]}>
    <boxGeometry args={[Math.hypot(dx,dz),0.08,0.16]}/>
    <meshBasicMaterial color={blue?"#648e9c":"#c29b72"} toneMapped={false}/>
  </mesh>;
}
function CausewaysAndGardens(){
  const segments=[
    [[-6,-13],[-1,-27]], [[-1,-27],[1,-37]], [[1,-37],[-2,-48]],
    [[-2,-48],[-12,-55]], [[-12,-55],[-17,-67]], [[-17,-67],[-22,-84]],
    [[-17,-67],[0,-77]],[[0,-77],[0,-88]], [[-17,-67],[18,-72]],[[18,-72],[21,-82]],
    [[1,-37],[14,-31]], [[1,-37],[-13,-44]], [[-13,-44],[-12,-55]]
  ];
  return <group>
    {segments.map(([a,b],i)=><Trace key={i} a={a} b={b} blue={i>7}/>)}
    {[[22,-62],[27,-65],[17,-65]].map(([x,z],i)=><group key={i} position={[x,BASE,z]}>
      <mesh position={[0,1.7,0]}><boxGeometry args={[4.7,3.4,4.2]}/><meshStandardMaterial color="#34485d"/></mesh>
      <mesh position={[0,3.6,0]}><boxGeometry args={[4.9,0.28,4.5]}/><meshBasicMaterial color={i===1?"#d8a16b":"#78bdc6"} toneMapped={false}/></mesh>
    </group>)}
    <mesh position={[-12,BASE+0.08,-43]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[3.5,3.7,36]}/><meshBasicMaterial color="#d3a36a" side={DoubleSide} toneMapped={false}/>
    </mesh>
    {Array.from({length:9},(_,i)=>{
      const t=i*2*Math.PI/9;
      return <mesh key={i} position={[-12+Math.cos(t)*3.7,BASE+0.8,-43+Math.sin(t)*3.7]}>
        <cylinderGeometry args={[0.16,0.25,1.6,6]}/><meshStandardMaterial color="#a7abae"/>
      </mesh>;
    })}
    <mesh position={[-12,BASE+0.76,-43]}><sphereGeometry args={[0.48,10,8]}/><meshStandardMaterial color="#e2c28b"/></mesh>
  </group>;
}
export function ShastaCampus({reducedMotion=false,arrayMode="beacon"}){
  return <group name="parallax-shasta-skyline-proxy">
    <Mountain/>
    <mesh position={[1,BASE-0.28,-60]}><boxGeometry args={[95,0.55,72]}/><meshStandardMaterial color="#263d48" roughness={1}/></mesh>
    <CausewaysAndGardens/>
    {campus.sisters.map(site=><Sister key={site.id} site={site}/>)}
    <RootTemple/><Trihelion reducedMotion={reducedMotion} arrayMode={arrayMode}/><Bloomforge/>
  </group>;
}
