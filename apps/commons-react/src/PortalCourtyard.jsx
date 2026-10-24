import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, Shape } from "three";
import { portalCourtyardPlan } from "./portalCourtyardPlan.mjs";

/**
 * Visual sculpture only. No pointer/canvas handlers, external textures, portals
 * that teleport the visitor, permission decisions, or hidden web requests.
 * All controls are separate accessible HTML buttons in Scene.jsx.
 */
function portalSilhouette() {
  const outline = new Shape();
  outline.moveTo(-1.36, 0.12);
  outline.lineTo(-1.36, 3.03);
  outline.quadraticCurveTo(-1.36, 5.12, 0, 5.12);
  outline.quadraticCurveTo(1.36, 5.12, 1.36, 3.03);
  outline.lineTo(1.36, 0.12);
  outline.closePath();
  return outline;
}

function Gate({ gate, index, reducedMotion }) {
  const halo = useRef(null);
  const interior = useMemo(portalSilhouette, []);
  useFrame(({ clock }) => {
    if (!halo.current || reducedMotion) return;
    const now = clock.getElapsedTime();
    halo.current.position.y = 3.15 + Math.sin(now * 0.65 + index * 1.7) * 0.17;
    halo.current.rotation.y = Math.sin(now * 0.23 + index) * 0.20;
  });
  return (
    <group position={[gate.x, gate.y, gate.z]} name={"story-sculpture-" + gate.id}>
      <mesh position={[0, 0.06, 0.12]}>
        <cylinderGeometry args={[2.30, 2.38, 0.24, 12]} />
        <meshStandardMaterial color="#465774" roughness={0.78} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.14, 0.16]}>
        <cylinderGeometry args={[1.81, 1.81, 0.06, 24]} />
        <meshBasicMaterial color={gate.color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <shapeGeometry args={[interior]} />
        <meshBasicMaterial color={gate.color} transparent opacity={0.27}
          depthWrite={false} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.17, 0.17]}>
        <shapeGeometry args={[interior]} />
        <meshBasicMaterial color="#172849" transparent opacity={0.51}
          depthWrite={false} side={DoubleSide} />
      </mesh>
      {[-1.48, 1.48].map(x => (
        <group key={x}>
          <mesh position={[x, 1.75, 0]}>
            <cylinderGeometry args={[0.22, 0.34, 3.45, 8]} />
            <meshStandardMaterial color="#c7b6a2" metalness={0.29} roughness={0.6}
              emissive={gate.color} emissiveIntensity={0.12} />
          </mesh>
          <mesh position={[x, 0.35, 0]}>
            <cylinderGeometry args={[0.42, 0.38, 0.55, 8]} />
            <meshStandardMaterial color="#7b7180" roughness={0.72} />
          </mesh>
          <mesh position={[x, 3.55, 0]}>
            <sphereGeometry args={[0.26, 8, 7]} />
            <meshBasicMaterial color={gate.color} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.57, 0]}>
        <torusGeometry args={[1.48, 0.22, 8, 38, Math.PI]} />
        <meshStandardMaterial color="#dfc7aa" roughness={0.50} metalness={0.40}
          emissive={gate.color} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 3.57, 0.04]}>
        <torusGeometry args={[1.34, 0.055, 6, 38, Math.PI]} />
        <meshBasicMaterial color={gate.color} toneMapped={false} />
      </mesh>
      <group ref={halo} position={[0, 3.15, 0.16]}>
        <mesh>
          <icosahedronGeometry args={[0.36, 0]} />
          <meshBasicMaterial color={gate.color} toneMapped={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.64, 0.036, 5, 30]} />
          <meshBasicMaterial color="#fcebd8" toneMapped={false} />
        </mesh>
      </group>
      <pointLight color={gate.color} intensity={5} distance={6} decay={2} position={[0, 3, 1]} />
    </group>
  );
}

function CouncilBeacon({ table, reducedMotion }) {
  const signal = useRef(null);
  useFrame(({ clock }) => {
    if (reducedMotion || !signal.current) return;
    signal.current.rotation.y = clock.getElapsedTime() * 0.10;
  });
  return (
    <group position={[table.x, table.y, table.z]}>
      <mesh position={[0, -0.13, 0]}>
        <cylinderGeometry args={[table.radius * 1.13, table.radius * 1.23, 0.35, 32]} />
        <meshStandardMaterial color="#75634f" metalness={0.38} roughness={0.64} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[table.radius, table.radius, 0.21, 40]} />
        <meshStandardMaterial color="#4a3661" emissive="#9c78db" emissiveIntensity={0.21}
          roughness={0.53} metalness={0.24} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.26, 0]}>
        <torusGeometry args={[1.85, 0.075, 7, 54]} />
        <meshBasicMaterial color="#d7b78a" toneMapped={false} />
      </mesh>
      <group ref={signal} position={[0, 1.62, 0]}>
        <mesh>
          <octahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#eacff2" emissive="#b18bff" emissiveIntensity={0.58}
            transparent opacity={0.88} metalness={0.30} roughness={0.35} />
        </mesh>
        {[0, Math.PI / 2].map(rotation => (
          <mesh key={rotation} rotation={[rotation, 0, 0]}>
            <torusGeometry args={[0.98, 0.045, 6, 44]} />
            <meshBasicMaterial color="#e6c5a2" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight color="#c59dff" intensity={8} distance={13} decay={2} position={[0, 2.7, 0]} />
    </group>
  );
}

function PathStone({ from, to, color }) {
  const midpoint = [(from[0] + to[0]) / 2, -0.18, (from[1] + to[1]) / 2];
  const dx = to[0] - from[0], dz = to[1] - from[1];
  const theta = -Math.atan2(dz, dx);
  return (
    <mesh position={midpoint} rotation={[0, theta, 0]}>
      <boxGeometry args={[Math.hypot(dx, dz), 0.075, 0.11]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

/** Courtyard of four independently themed worlds + decorative Roundtable heart. */
export function PortalCourtyard({ reducedMotion = false }) {
  const plan = useMemo(portalCourtyardPlan, []);
  return (
    <group name="commons-portal-courtyard-public-art">
      <mesh position={[0, -0.69, -16.7]}>
        <cylinderGeometry args={[19.1, 18.2, 0.85, 52]} />
        <meshStandardMaterial color="#56657a" roughness={0.93} metalness={0.04} />
      </mesh>
      <mesh position={[0, -0.24, -16.7]}>
        <cylinderGeometry args={[17.7, 17.7, 0.06, 52]} />
        <meshStandardMaterial color="#1c3551" roughness={0.87} />
      </mesh>
      <mesh position={[0, -0.13, -16.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[15.3, 0.08, 6, 64]} />
        <meshBasicMaterial color="#a99277" toneMapped={false} />
      </mesh>
      {plan.gates.map((gate, index) => (
        <React.Fragment key={gate.id}>
          <PathStone from={[0, plan.centralTable.z]} to={[gate.x, gate.z + 1.7]} color={gate.color} />
          <Gate gate={gate} index={index} reducedMotion={reducedMotion} />
        </React.Fragment>
      ))}
      <CouncilBeacon table={plan.centralTable} reducedMotion={reducedMotion} />
      {[-17, 17].map(x => (
        <group key={x} position={[x, 0, -12]}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.23, 0.48, 2.1, 8]} />
            <meshStandardMaterial color="#a88b6b" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.25, 0]}>
            <octahedronGeometry args={[0.48]} />
            <meshBasicMaterial color="#e7bd89" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -1.27, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12.6, 5.3]} />
        <meshStandardMaterial color="#29435b" roughness={0.91} side={DoubleSide} />
      </mesh>
    </group>
  );
}
