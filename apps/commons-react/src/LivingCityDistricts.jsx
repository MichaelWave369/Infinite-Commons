import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Object3D } from "three";
import { districtPlan } from "./livingCityDistrictPlan.mjs";

// Decorative silhouettes only. Three instanced batches, with inexpensive
// glowing strip accents for the implied residential neighborhood.
function Batch({ blocks, color, light = false }) {
  const mesh = useRef();
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const transform = new Object3D();
    blocks.forEach((b, i) => {
      transform.position.set(b.x, b.y, b.z);
      transform.scale.set(b.width, b.height, b.depth);
      transform.rotation.set(0, 0, 0);
      transform.updateMatrix();
      mesh.current.setMatrixAt(i, transform.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [blocks]);
  return (
    <instancedMesh ref={mesh} args={[null, null, blocks.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      {light
        ? <meshBasicMaterial color={color} toneMapped={false} />
        : <meshStandardMaterial color={color} roughness={0.93} metalness={0.05} />}
    </instancedMesh>
  );
}

export function LivingCityDistricts() {
  const plan = useMemo(() => districtPlan(), []);
  return (
    <group>
      <Batch blocks={plan.far.buildings} color="#173457" />
      <Batch blocks={plan.far.lights} color="#be876b" light />
      <Batch blocks={plan.middle.buildings} color="#254869" />
      <Batch blocks={plan.middle.lights} color="#eaa978" light />
      <Batch blocks={plan.near.buildings} color="#365b77" />
      <Batch blocks={plan.near.lights} color="#e8b27e" light />
    </group>
  );
}
