import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// A few deliberate slow story beats. No constant random flashing, autoplay
// audio, fetched particles, live telemetry or simulated real human activity.
export function LivingCityMotion({ reducedMotion = false }) {
  const radioLight = useRef(null);
  const doorway = useRef(null);
  const aircraft = useRef(null);
  const distantWindow = useRef(null);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    if (radioLight.current) {
      radioLight.current.material.opacity = 0.65 + Math.sin(t * 0.9) * 0.16;
    }
    if (doorway.current) {
      doorway.current.material.opacity = 0.10 + (Math.sin(t * 0.24) + 1) * 0.035;
    }
    if (distantWindow.current) {
      distantWindow.current.material.opacity = 0.57 + (Math.sin(t * 0.41) + 1) * 0.12;
    }
    if (aircraft.current) {
      aircraft.current.position.x = -24 + ((t * 0.72) % 48);
    }
  });

  return (
    <group>
      <mesh ref={doorway} position={[-4.95, 1.52, -1.82]}>
        <planeGeometry args={[2.10, 3.65]} />
        <meshBasicMaterial color="#f9bb85" transparent opacity={0.13}
          depthWrite={false} toneMapped={false} />
      </mesh>
      {/* Tiny radio indicator above the existing radio/table silhouette. */}
      <mesh ref={radioLight} position={[2.32, 0.47, 2.79]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#90f9df" transparent opacity={0.70}
          toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={distantWindow} position={[6.2, 9.4, -46]}>
        <planeGeometry args={[0.13, 0.15]} />
        <meshBasicMaterial color="#ffd49c" transparent opacity={0.70}
          toneMapped={false} depthWrite={false} side={2} />
      </mesh>
      {/* Single distant moving navigation light, NOT simulated live traffic. */}
      <group ref={aircraft} position={[-24, 17.5, -91]}>
        <mesh>
          <sphereGeometry args={[0.10, 6, 6]} />
          <meshBasicMaterial color="#f4c6a3" toneMapped={false} />
        </mesh>
        <mesh position={[0.20, 0, 0]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshBasicMaterial color="#96e1f2" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
