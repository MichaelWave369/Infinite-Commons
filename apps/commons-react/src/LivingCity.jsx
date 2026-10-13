import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, Object3D } from "three";
import { livingCityBlueprint } from "./livingCityBlueprint.mjs";
import { PaintedSky, ArchitecturalAtmosphere } from "./LivingCityAtmosphere.jsx";

/**
 * Optional three-dimensional art interpretation of commons.arrival.
 * All world/identity/permissions/hotspot controls stay in the HTML overlay.
 * This canvas is decorative and contains no network or user-provided objects.
 */
function CityInstances() {
  const towersRef = useRef();
  const windowsRef = useRef();
  const { buildings, windows } = useMemo(() => livingCityBlueprint(), []);
  useLayoutEffect(() => {
    const matrix = new Object3D();
    const colors = ["#123458", "#173d68", "#0c274b", "#1a426a"];
    buildings.forEach((building, index) => {
      matrix.position.set(building.x, building.y, building.z);
      matrix.scale.set(building.width, building.height, building.depth);
      matrix.rotation.set(0, 0, 0);
      matrix.updateMatrix();
      towersRef.current.setMatrixAt(index, matrix.matrix);
      towersRef.current.setColorAt(index, new Color(colors[building.tone]));
    });
    towersRef.current.instanceMatrix.needsUpdate = true;
    if (towersRef.current.instanceColor) towersRef.current.instanceColor.needsUpdate = true;
    windows.forEach((window, index) => {
      matrix.position.set(window.x, window.y, window.z);
      matrix.scale.set(0.20, 0.26, 0.05);
      matrix.updateMatrix();
      windowsRef.current.setMatrixAt(index, matrix.matrix);
      windowsRef.current.setColorAt(index, new Color(window.warm ? "#ffbd75" : "#77cbea"));
    });
    windowsRef.current.instanceMatrix.needsUpdate = true;
    if (windowsRef.current.instanceColor) windowsRef.current.instanceColor.needsUpdate = true;
  }, [buildings, windows]);

  return (
    <>
      <instancedMesh ref={towersRef} args={[null, null, buildings.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors={false} color="#ffffff" roughness={0.85} metalness={0.12} />
      </instancedMesh>
      <instancedMesh ref={windowsRef} args={[null, null, windows.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function Structure({ position, scale, color, emissive = "#000000", emissiveIntensity = 0, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} emissive={emissive}
        emissiveIntensity={emissiveIntensity} roughness={0.78} metalness={0.06} />
    </mesh>
  );
}

function Stars() {
  const dots = useMemo(() => {
    let state = 763;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    return Array.from({ length: 65 }, (_, i) => ({
      id: i, x: (random() - 0.5) * 125, y: 9 + random() * 35, z: -115,
      size: 0.065 + random() * 0.10
    }));
  }, []);
  return (
    <group>
      {dots.map(s => (
        <mesh key={s.id} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[s.size, 5, 5]} />
          <meshBasicMaterial color="#cbe5fe" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Clouds({ reducedMotion }) {
  const near = useRef();
  const far = useRef();
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const seconds = clock.getElapsedTime();
    if (near.current) near.current.position.x = Math.sin(seconds * 0.055) * 1.4;
    if (far.current) far.current.position.x = -Math.sin(seconds * 0.034) * 1.9;
  });
  return (
    <>
      <group ref={near} position={[0, 0, -51]}>
        {[-12, -8, -2, 5, 12].map((x, i) => (
          <mesh key={i} position={[x, 11 + (i % 2) * 1.2, -i * 1.3]} scale={[7, 0.7, 2]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#88adc7" transparent opacity={0.085} depthWrite={false} />
          </mesh>
        ))}
      </group>
      <group ref={far} position={[0, 0, -93]}>
        {[-23, -10, 7, 23].map((x, i) => (
          <mesh key={i} position={[x, 17 + i * 0.3, 0]} scale={[9, 0.6, 3]}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#abd1e7" transparent opacity={0.045} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Terrace() {
  return (
    <group>
      {/* Architectural platform, stair-step edges and guard rails. */}
      <Structure position={[0, -1.1, 2]} scale={[20, 0.45, 10]} color="#b4b6ac" />
      <Structure position={[0, -1.38, 7.0]} scale={[20, 0.38, 0.20]} color="#20384d"
        emissive="#f1a45a" emissiveIntensity={0.35} />
      {Array.from({ length: 4 }, (_, i) => (
        <group key={i}>
          <Structure position={[-5.4, -1.50 - i * 0.32, 7.25 + i * 0.55]}
            scale={[9.1 - i * 0.20, 0.32, 0.56]} color="#213550" />
          <Structure position={[-5.4, -1.35 - i * 0.32, 7.54 + i * 0.55]}
            scale={[9.1 - i * 0.20, 0.07, 0.06]} color="#d88b59"
            emissive="#ff9d58" emissiveIntensity={1.6} />
        </group>
      ))}
      <Structure position={[-7.2, 3.8, -3.1]} scale={[7.3, 10.0, 1.5]} color="#214b71" />
      <Structure position={[-7.2, 8.95, -3.1]} scale={[8.1, 0.38, 2.0]} color="#0e2747" />
      <Structure position={[-4.65, 1.48, -2.25]} scale={[3.15, 5.4, 0.10]}
        color="#9e3a36" emissive="#ed663d" emissiveIntensity={1.5} />
      <Structure position={[-4.65, 1.65, -2.15]} scale={[2.62, 4.98, 0.11]}
        color="#f28c60" emissive="#fe8759" emissiveIntensity={2.15} />
      <Structure position={[-4.65, 1.54, -2.05]} scale={[0.085, 5.0, 0.16]} color="#45253d" />
      <Structure position={[-6.2, 1.54, -2.06]} scale={[0.12, 5.0, 0.16]} color="#48253e" />
      <Structure position={[-3.1, 1.54, -2.06]} scale={[0.12, 5.0, 0.16]} color="#48253e" />
      <pointLight position={[-4.6, 2.5, 0.1]} color="#ffac67" intensity={38} distance={14} decay={2} />
      {/* Glass balustrade and brass piping. */}
      <Structure position={[5.8, 0.15, 5.3]} scale={[0.10, 2.6, 0.12]} color="#8397aa" />
      <Structure position={[9.0, 0.15, 5.3]} scale={[0.10, 2.6, 0.12]} color="#8397aa" />
      <Structure position={[7.4, 1.45, 5.3]} scale={[3.4, 0.11, 0.15]} color="#d2c5aa" />
      <Structure position={[7.4, 0.26, 5.32]} scale={[3.1, 2.18, 0.055]} color="#73b6d2" />
      {/* Lounge chair silhouette, handmade procedural geometry. */}
      <group position={[-1.15, -0.38, 2.3]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.6, 0.2]} rotation={[-0.13, 0, 0]}>
          <boxGeometry args={[2.6, 0.32, 1.2]} />
          <meshStandardMaterial color="#a65538" roughness={0.85} />
        </mesh>
        <mesh position={[0, 1.25, -0.32]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[2.6, 1.45, 0.27]} />
          <meshStandardMaterial color="#c67a53" roughness={0.8} />
        </mesh>
        {[-0.97, 0.97].map(x => (
          <group key={x}>
            <Structure position={[x, 0.1, 0.60]} scale={[0.11, 0.78, 0.11]} color="#1d3041" />
            <Structure position={[x, 0.1, -0.35]} scale={[0.11, 0.78, 0.11]} color="#1d3041" />
          </group>
        ))}
      </group>
      {/* Little midnight-radio table. */}
      <mesh position={[2.7, 0.0, 2.5]}>
        <cylinderGeometry args={[0.89, 0.89, 0.11, 32]} />
        <meshStandardMaterial color="#3d3940" metalness={0.38} roughness={0.45} />
      </mesh>
      <mesh position={[2.7, -0.52, 2.5]}>
        <cylinderGeometry args={[0.10, 0.10, 1.0, 10]} />
        <meshStandardMaterial color="#243146" />
      </mesh>
      <Structure position={[2.5, 0.38, 2.55]} scale={[0.6, 0.55, 0.38]}
        color="#9b5f41" emissive="#6e3322" emissiveIntensity={0.2} />
      <mesh position={[2.55, 0.42, 2.76]}>
        <sphereGeometry args={[0.10, 12, 12]} />
        <meshBasicMaterial color="#ffb764" />
      </mesh>
    </group>
  );
}

function LivingEnvironment({ reducedMotion }) {
  return (
    <>
      <color attach="background" args={["#0b3d78"]} />
      <fog attach="fog" args={["#0d3a68", 28, 128]} />
      <ambientLight intensity={1.15} color="#93b9e3" />
      <hemisphereLight args={["#96c4ee", "#17233b", 1.45]} />
      <directionalLight position={[-10, 19, 8]} color="#f3ba86" intensity={1.5} />
      <PaintedSky />
      <Stars />
      <Clouds reducedMotion={reducedMotion} />
      <CityInstances />
      <Terrace />
      <ArchitecturalAtmosphere />
    </>
  );
}

export default function LivingCity({ reducedMotion = false, onError }) {
  return (
    <Canvas
      className="living-city-canvas"
      camera={{ position: [11.5, 7.5, 20], fov: 46, near: 0.1, far: 260 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "low-power" }}
      frameloop={reducedMotion ? "demand" : "always"}
      onCreated={({ gl, camera }) => {
        camera.lookAt(0, 1.4, -23);
        gl.setClearColor("#0b3d78");
      }}
      onError={onError}
    >
      <LivingEnvironment reducedMotion={reducedMotion} />
    </Canvas>
  );
}
