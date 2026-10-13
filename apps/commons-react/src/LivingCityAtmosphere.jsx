import React, { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { atmospherePlan } from "./atmospherePlan.mjs";

/**
 * A small hand-authored/procedural sky texture and 3D architectural
 * flourishes. Entirely local, deterministic, no image downloads or APIs.
 */
function paintMountain(ctx, points, color, bottom) {
  ctx.beginPath();
  ctx.moveTo(0, bottom);
  for (const point of points) ctx.lineTo(point.x, point.y);
  ctx.lineTo(1024, bottom);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export function createMidnightSkyTexture() {
  const plan = atmospherePlan(369);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to paint atmospheric sky");

  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, "#061632");
  sky.addColorStop(0.28, "#092c58");
  sky.addColorStop(0.61, "#185583");
  sky.addColorStop(0.83, "#536781");
  sky.addColorStop(1, "#172e53");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);

  const horizon = ctx.createRadialGradient(520, 365, 12, 520, 365, 540);
  horizon.addColorStop(0, "rgba(249,157,95,.26)");
  horizon.addColorStop(0.36, "rgba(181,120,122,.12)");
  horizon.addColorStop(1, "rgba(70,118,181,0)");
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, 1024, 512);

  for (const band of plan.bands) {
    ctx.fillStyle = "rgba(192,215,250," + band.alpha + ")";
    ctx.beginPath();
    ctx.ellipse(band.x, band.y, band.width, band.height, -0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  paintMountain(ctx, plan.distantRidge, "#183754", 512);
  paintMountain(ctx, plan.foregroundRidge, "#0b2748", 512);

  for (const stroke of plan.strokes) {
    ctx.fillStyle = stroke.warm
      ? "rgba(255,194,131," + stroke.alpha + ")"
      : "rgba(190,220,246," + stroke.alpha + ")";
    ctx.beginPath();
    ctx.ellipse(stroke.x, stroke.y, stroke.radius * 2.4, stroke.radius,
      -0.42, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function PaintedSky() {
  const texture = useMemo(() => createMidnightSkyTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, -12, -124]} renderOrder={-100}>
      <planeGeometry args={[320, 180]} />
      <meshBasicMaterial map={texture} fog={false} depthWrite={false}
        toneMapped={false} />
    </mesh>
  );
}

function GlowingStep({ z, x, length }) {
  return (
    <mesh position={[x, -1.11, z]}>
      <boxGeometry args={[length, 0.025, 0.07]} />
      <meshBasicMaterial color="#ffbc83" toneMapped={false} />
    </mesh>
  );
}

function StonePlanter({ x, z }) {
  return (
    <group position={[x, -0.83, z]}>
      <mesh position={[0, 0.43, 0]}>
        <cylinderGeometry args={[0.56, 0.46, 0.9, 9]} />
        <meshStandardMaterial color="#536677" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.89, 0]}>
        <cylinderGeometry args={[0.53, 0.53, 0.11, 9]} />
        <meshStandardMaterial color="#253c42" roughness={0.9} />
      </mesh>
      {[
        [0, 1.37, 0, 0.75],
        [-0.33, 1.15, -0.07, 0.48],
        [0.31, 1.12, 0.13, 0.50],
        [0.03, 1.65, 0.04, 0.48]
      ].map(([px, py, pz, scale], index) => (
        <mesh key={index} position={[px, py, pz]} scale={[scale, scale * 1.36, scale]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={index % 2 ? "#245a52" : "#397b72"}
            roughness={0.96} flatShading />
        </mesh>
      ))}
    </group>
  );
}

export function ArchitecturalAtmosphere() {
  return (
    <group>
      <GlowingStep x={0} z={6.85} length={19.0} />
      <GlowingStep x={-4.95} z={9.0} length={8.7} />
      <GlowingStep x={-4.95} z={9.55} length={8.4} />
      <StonePlanter x={7.8} z={-0.2} />
      <StonePlanter x={8.6} z={3.6} />
      {[-8.9, -5.9].map((x) => (
        <group key={x} position={[x, 5.2, -2.24]}>
          <mesh>
            <boxGeometry args={[0.33, 0.78, 0.17]} />
            <meshStandardMaterial color="#3e4753" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <boxGeometry args={[0.23, 0.58, 0.07]} />
            <meshBasicMaterial color="#ffd098" toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.1, 0.65]} color="#ffb87c"
            intensity={5} distance={5} decay={2} />
        </group>
      ))}
    </group>
  );
}
