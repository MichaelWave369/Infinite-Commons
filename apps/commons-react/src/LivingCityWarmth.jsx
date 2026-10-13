import React from "react";

// Hand-authored original low-poly furnishings. No outside images, GLTF assets,
// external requests, sound autoplay or network interaction.

function Box({ position, size, color, roughness = 0.84, metalness = 0.05, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function PorchRug() {
  return (
    <group>
      {/* Woven sitting-area inset, laid on the existing stone floor. */}
      <mesh position={[0.15, -0.840, 2.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.7, 3.55]} />
        <meshStandardMaterial color="#334f5a" roughness={1} />
      </mesh>
      {[-2.95, -2.72, 2.72, 2.95].map(x => (
        <Box key={x} position={[0.15 + x, -0.831, 2.55]}
          size={[0.038, 0.012, 3.40]} color="#b18a6b" />
      ))}
      {[-1.53, 1.53].map(z => (
        <Box key={z} position={[0.15, -0.831, 2.55 + z]}
          size={[6.05, 0.012, 0.033]} color="#b18a6b" />
      ))}
      <mesh position={[0.15, -0.829, 2.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.87, 0.89, 48]} />
        <meshBasicMaterial color="#d5ac82" transparent opacity={0.53} />
      </mesh>
    </group>
  );
}

function PaperNotebook() {
  // Small personal object on the circular radio table.
  return (
    <group position={[2.35, 0.12, 1.96]} rotation={[0, 0.24, 0]}>
      <Box position={[0, 0.01, 0]} size={[0.55, 0.075, 0.38]} color="#9f5e48" />
      <Box position={[0, 0.056, 0]} size={[0.48, 0.015, 0.32]} color="#e2c8a9" />
      <Box position={[-0.23, 0.064, 0]} size={[0.018, 0.025, 0.38]} color="#b99c77" />
    </group>
  );
}

function LittleMug() {
  return (
    <group position={[3.18, 0.07, 2.72]}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.35, 12]} />
        <meshStandardMaterial color="#dad0b6" roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.141, 0.141, 0.018, 12]} />
        <meshStandardMaterial color="#4d3029" roughness={0.8} />
      </mesh>
      <mesh position={[0.19, 0.20, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.105, 0.034, 6, 14]} />
        <meshStandardMaterial color="#dad0b6" roughness={0.42} />
      </mesh>
    </group>
  );
}

function PorchLantern() {
  return (
    <group position={[-3.45, -0.82, 2.0]}>
      <Box position={[0, 0.035, 0]} size={[0.45, 0.07, 0.45]} color="#413f43" metalness={0.4} />
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.15, 0.16, 0.38, 8]} />
        <meshStandardMaterial color="#dbb487" emissive="#e39760" emissiveIntensity={0.35}
          transparent opacity={0.83} roughness={0.35} />
      </mesh>
      <Box position={[0, 0.49, 0]} size={[0.34, 0.08, 0.34]} color="#443e42" />
      <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.025, 6, 10]} />
        <meshStandardMaterial color="#9c7e66" metalness={0.4} roughness={0.55} />
      </mesh>
      <pointLight position={[0, 0.31, 0]} color="#ffd2a2" intensity={4} distance={4.5} decay={2} />
    </group>
  );
}

function TinySucculent() {
  return (
    <group position={[3.9, -0.84, 1.35]}>
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.43, 0.34, 0.48, 9]} />
        <meshStandardMaterial color="#8d6b58" roughness={0.95} />
      </mesh>
      {[
        [0.06, 0.67, -0.13, 0.38],
        [-0.26, 0.55, 0.06, 0.29],
        [0.24, 0.55, 0.1, 0.28],
        [-0.02, 0.77, 0.16, 0.24]
      ].map(([x, y, z, size], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0.1, i * 0.7, -0.15]}
          scale={[size, size * 1.5, size * 0.65]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 2 ? "#356d5b" : "#50836b"}
            roughness={0.98} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function HumanScaleFacade() {
  return (
    <group>
      {/* Recessed roof shadow and warm trim break up the flat wall. */}
      <Box position={[-7.30, 7.84, -2.15]} size={[7.85, 0.17, 0.24]}
        color="#152e49" />
      <Box position={[-7.30, 7.65, -2.08]} size={[7.57, 0.045, 0.13]}
        color="#98785e" />
      {[-10.75, -10.15, -9.55].map(x => (
        <Box key={x} position={[x, 3.45, -2.28]} size={[0.085, 7.2, 0.12]}
          color="#37536d" />
      ))}
      {/* Interior silhouette hinted at through the doorway; no actual room exists. */}
      <Box position={[-5.83, 0.42, -1.95]} size={[0.16, 2.20, 0.08]}
        color="#724a43" />
      <Box position={[-5.63, 1.46, -1.95]} size={[0.52, 0.08, 0.08]}
        color="#724a43" />
      <Box position={[-5.63, 0.67, -1.95]} size={[0.52, 0.08, 0.08]}
        color="#724a43" />
    </group>
  );
}

export function LivingCityWarmth() {
  return (
    <group>
      <PorchRug />
      <PaperNotebook />
      <LittleMug />
      <PorchLantern />
      <TinySucculent />
      <HumanScaleFacade />
      {/* One small, warm light pool rather than a costly shadow/bloom pipeline. */}
      <pointLight position={[-1.05, 2.0, 2.25]} color="#f0b689"
        intensity={7} distance={7.5} decay={2} />
    </group>
  );
}
