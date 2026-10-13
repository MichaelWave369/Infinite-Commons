import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Object3D } from "three";
import { architecturalSoulPlan } from "./architecturalSoulPlan.mjs";

/**
 * Purely decorative, original low-poly Art-Deco vocabulary for the city.
 * No location IDs, navigation links, imported assets, or public data.
 */
function InstancedDetails({ items, color, glowing = false }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const obj = new Object3D();
    items.forEach((part, i) => {
      obj.position.set(part.x, part.y, part.z);
      obj.scale.set(part.width, part.height, part.depth);
      obj.rotation.set(0, 0, 0);
      obj.updateMatrix();
      ref.current.setMatrixAt(i, obj.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      {glowing
        ? <meshBasicMaterial color={color} toneMapped={false} />
        : <meshStandardMaterial color={color} roughness={0.82} metalness={0.10} />}
    </instancedMesh>
  );
}

function RoofLeaves({ items }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const transform = new Object3D();
    items.forEach((item, i) => {
      transform.position.set(item.x, item.y, item.z);
      transform.scale.set(item.width, item.height, item.depth);
      transform.rotation.set(0, 0, i % 2 ? 0.13 : -0.13);
      transform.updateMatrix();
      ref.current.setMatrixAt(i, transform.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#39746b" flatShading roughness={0.95} />
    </instancedMesh>
  );
}

function Skybridge({ bridge }) {
  return (
    <group position={[bridge.x, bridge.y, bridge.z]}
      rotation={[0, bridge.angle, 0]}>
      <mesh>
        <boxGeometry args={[bridge.length + 1.0, 0.17, 0.86]} />
        <meshStandardMaterial color="#586878" roughness={0.85} metalness={0.11} />
      </mesh>
      {[-0.42, 0.42].map(side => (
        <group key={side} position={[0, 0, side]}>
          <mesh position={[0, 0.40, 0]}>
            <boxGeometry args={[bridge.length + 1.0, 0.065, 0.08]} />
            <meshStandardMaterial color="#94a7b4" roughness={0.45} metalness={0.25} />
          </mesh>
          {[-0.35, 0.35].map(frac => (
            <mesh key={frac} position={[bridge.length * frac, 0.18, 0]}>
              <boxGeometry args={[0.06, 0.43, 0.08]} />
              <meshStandardMaterial color="#647f91" roughness={0.62} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[bridge.length * 0.86, 0.018, 0.11]} />
        <meshBasicMaterial color="#cf9b78" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function LivingCityArchitecture() {
  const plan = useMemo(() => architecturalSoulPlan(), []);
  return (
    <group>
      <InstancedDetails items={plan.facadeFins} color="#476784" />
      <InstancedDetails items={plan.cornices} color="#73869a" />
      <InstancedDetails items={plan.warmBands} color="#dbaa83" glowing />
      <InstancedDetails items={plan.balconyRails} color="#829aab" />
      <InstancedDetails items={plan.roofPlanters} color="#385a5a" />
      <RoofLeaves items={plan.rooftopLeaves} />
      {plan.skybridges.map((bridge, i) => <Skybridge bridge={bridge} key={i} />)}
    </group>
  );
}

/** Small foreground facade language, visibly architectural rather than flat. */
export function PorchFacadeSoul() {
  return (
    <group>
      {[-10.9, -9.85, -8.8].map((x, index) => (
        <group key={x} position={[x, 4.25, -2.29]}>
          <mesh>
            <boxGeometry args={[0.105, 5.3, 0.14]} />
            <meshStandardMaterial color="#56708a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.43, 0.075]}>
            <boxGeometry args={[0.26, 0.18, 0.12]} />
            <meshStandardMaterial color="#ad9379" roughness={0.6} />
          </mesh>
          {index !== 1 && (
            <mesh position={[0, -1.38, 0.10]}>
              <boxGeometry args={[0.08, 0.55, 0.045]} />
              <meshBasicMaterial color="#7fadc4" toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
      {/* Warm recessed transom above the entrance, not another floating sign. */}
      <mesh position={[-4.95, 4.00, -1.98]}>
        <boxGeometry args={[2.18, 0.22, 0.07]} />
        <meshBasicMaterial color="#e9af7d" toneMapped={false} />
      </mesh>
      <mesh position={[-4.95, 4.17, -2.00]}>
        <boxGeometry args={[2.55, 0.12, 0.13]} />
        <meshStandardMaterial color="#523f40" roughness={0.7} />
      </mesh>
    </group>
  );
}
