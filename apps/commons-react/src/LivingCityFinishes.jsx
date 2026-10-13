import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { CanvasTexture, Object3D, RepeatWrapping, SRGBColorSpace } from "three";
import { citySilhouettePlan } from "./citySilhouettePlan.mjs";

/**
 * Artist-authored low-cost geometry and local procedural surface treatment.
 * No fetched assets or network/world authority; decoration only.
 */
function InstanceBlocks({ boxes, color, metalness = 0, roughness = 0.8 }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const item = new Object3D();
    for (let i = 0; i < boxes.length; i += 1) {
      const b = boxes[i];
      item.position.set(b.x, b.y, b.z);
      item.scale.set(b.width, b.height, b.depth);
      item.rotation.set(0, 0, 0);
      item.updateMatrix();
      ref.current.setMatrixAt(i, item.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [boxes]);
  return (
    <instancedMesh ref={ref} args={[null, null, boxes.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}

export function CityRooflines() {
  const plan = useMemo(() => citySilhouettePlan(), []);
  return (
    <group>
      <InstanceBlocks boxes={plan.roofs} color="#48647a" roughness={0.67} metalness={0.14} />
      <InstanceBlocks boxes={plan.crowns} color="#243b59" roughness={0.72} />
      <InstanceBlocks boxes={plan.balconies} color="#526e88" roughness={0.78} />
      <InstanceBlocks boxes={plan.antennae} color="#8d9caf" metalness={0.4} roughness={0.4} />
    </group>
  );
}

export function LandmarkArchitecture() {
  return (
    <group>
      {/* Meridian observatory, distant stepped Art-Deco signal tower. */}
      <group position={[23, -7, -81]}>
        <mesh position={[0, 13.5, 0]}>
          <boxGeometry args={[4.8, 27, 3.8]} />
          <meshStandardMaterial color="#1b3859" roughness={0.76} />
        </mesh>
        <mesh position={[0, 27.4, 0]}>
          <boxGeometry args={[3.5, 2.6, 3.2]} />
          <meshStandardMaterial color="#54738f" roughness={0.72} />
        </mesh>
        <mesh position={[0, 29.2, 0]}>
          <boxGeometry args={[2.3, 1.6, 2.5]} />
          <meshStandardMaterial color="#263f5f" roughness={0.72} />
        </mesh>
        <mesh position={[0, 30.4, 0]}>
          <cylinderGeometry args={[0.16, 0.34, 2.2, 8]} />
          <meshStandardMaterial color="#b7a07a" metalness={0.35} roughness={0.5} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) => (
          <mesh key={i} position={[0, 25 - i * 2.1, 1.99]}>
            <boxGeometry args={[2.55, 0.23, 0.08]} />
            <meshBasicMaterial color="#dca776" toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* A warm rooftop beacon: identifiable destination, not an actual node. */}
      <group position={[-23, -7, -67]}>
        <mesh position={[0, 9.0, 0]}>
          <cylinderGeometry args={[2.2, 2.7, 18, 10]} />
          <meshStandardMaterial color="#294a66" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0, 18.8, 0]}>
          <cylinderGeometry args={[2.5, 2.0, 1.2, 10]} />
          <meshStandardMaterial color="#6a7480" roughness={0.78} flatShading />
        </mesh>
        <mesh position={[0, 19.8, 0]}>
          <sphereGeometry args={[0.52, 10, 7]} />
          <meshBasicMaterial color="#f4b77a" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function createTerraceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not paint terrace material");
  const base = ctx.createLinearGradient(0, 0, 512, 512);
  base.addColorStop(0, "#918e88");
  base.addColorStop(0.4, "#ada398");
  base.addColorStop(1, "#747e87");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Original subtle stone seams and stipple, fixed seed for reproducibility.
  let value = 369;
  const next = () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
  ctx.strokeStyle = "rgba(33,48,61,.19)";
  ctx.lineWidth = 2;
  for (const x of [0, 256, 511]) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
  }
  for (const y of [0, 255, 511]) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
  }
  for (let i = 0; i < 1100; i += 1) {
    ctx.fillStyle = next() > 0.5 ? "rgba(240,212,180,.09)" : "rgba(18,35,48,.07)";
    ctx.fillRect(next() * 512, next() * 512, 1 + next() * 2.3, 1 + next() * 2.3);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 1.5);
  texture.needsUpdate = true;
  return texture;
}

export function TerraceStoneSurface() {
  const texture = useMemo(createTerraceTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, -0.863, 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[19.85, 9.9]} />
      <meshStandardMaterial map={texture} roughness={0.93} metalness={0} />
    </mesh>
  );
}

export function EntranceDetails() {
  return (
    <group>
      {/* Visually recess the portal into its building facade. */}
      <mesh position={[-4.95, 1.48, -2.18]}>
        <boxGeometry args={[3.36, 5.48, 0.14]} />
        <meshStandardMaterial color="#17243c" roughness={0.75} />
      </mesh>
      <mesh position={[-4.95, 1.48, -2.055]}>
        <boxGeometry args={[2.85, 4.98, 0.09]} />
        <meshStandardMaterial color="#c88662" emissive="#c86d3d"
          emissiveIntensity={0.3} roughness={0.72} />
      </mesh>
      <mesh position={[-4.95, 3.7, -1.99]}>
        <boxGeometry args={[2.5, 0.17, 0.12]} />
        <meshBasicMaterial color="#ffd3a1" toneMapped={false} />
      </mesh>
      <mesh position={[-4.95, -1.18, -1.4]}>
        <boxGeometry args={[3.1, 0.13, 1.6]} />
        <meshStandardMaterial color="#755449" roughness={0.78} />
      </mesh>
      {/* Low warm spill on the terrace; lamp is existing. */}
      <mesh position={[-4.95, -0.854, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.1, 3.5]} />
        <meshBasicMaterial color="#f8a464" transparent opacity={0.16}
          depthWrite={false} toneMapped={false} side={2} />
      </mesh>
    </group>
  );
}

export function LoungeCushions() {
  return (
    <group position={[-1.15, -0.38, 2.3]} rotation={[0, -0.25, 0]}>
      <mesh position={[0, 0.85, 0.22]} scale={[1.17, 0.16, 0.53]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#c7845c" roughness={1} />
      </mesh>
      <mesh position={[0, 1.42, -0.17]} rotation={[-0.4, 0, 0]}
        scale={[1.15, 0.67, 0.18]}>
        <sphereGeometry args={[1, 18, 12]} />
        <meshStandardMaterial color="#af6448" roughness={1} />
      </mesh>
      {[-1.2, 1.2].map(x => (
        <mesh key={x} position={[x, 0.88, 0.12]}>
          <boxGeometry args={[0.20, 0.20, 1.17]} />
          <meshStandardMaterial color="#714331" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
