import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useApp } from "../store";

function makeCloudTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 10, 64, 64, 60);
  grd.addColorStop(0, "rgba(255,255,255,0.9)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function Weather() {
  const theme = useApp((s) => s.theme);
  const snow = theme === "snow";
  const rain = theme === "rain";
  const spa = theme === "spa";
  const sunset = theme === "sunset";
  const night = theme === "night";

  return (
    <>
      {(snow || rain) && <Precip kind={snow ? "snow" : "rain"} />}
      {spa && <SpaSteam />}
      {(sunset || night || spa) && <GodRays />}
      {theme === "morning" && <Clouds tint="#ffffff" />}
      {theme === "snow" && <Clouds tint="#eef6ff" />}
      {theme === "rain" && <Clouds tint="#9aabbb" dense />}
    </>
  );
}

function Precip({ kind }: { kind: "snow" | "rain" }) {
  const count = kind === "snow" ? 1400 : 2200;
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      speeds[i] = kind === "snow" ? 0.6 + Math.random() * 0.8 : 8 + Math.random() * 6;
    }
    return { positions, speeds };
  }, [count, kind]);

  useFrame((_, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speeds[i] * dt;
      if (kind === "snow") arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.4 + i) * dt * 0.3;
      else arr[i * 3] += dt * 0.8;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 18 + Math.random() * 4;
        arr[i * 3] = (Math.random() - 0.5) * 40;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={kind === "snow" ? 0.12 : 0.045}
        color={kind === "snow" ? "#ffffff" : "#c5d4e4"}
        transparent
        opacity={kind === "snow" ? 0.9 : 0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function SpaSteam() {
  const ref = useRef<THREE.Points>(null);
  const count = 500;
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 4;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.25 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, dt) => {
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * dt * 0.15;
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = 0.4;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.28}
        color="#ffd4c4"
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </points>
  );
}

function GodRays() {
  return (
    <mesh position={[0, 8, 0]} rotation={[0, 0.4, 0.15]}>
      <coneGeometry args={[7, 16, 24, 1, true]} />
      <meshBasicMaterial
        color="#ffc4a0"
        transparent
        opacity={0.045}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function Clouds({ tint, dense }: { tint: string; dense?: boolean }) {
  const tex = useMemo(makeCloudTexture, []);
  const items = useMemo(() => {
    const n = dense ? 18 : 10;
    return Array.from({ length: n }, (_, i) => ({
      x: (i % 6) * 7 - 18 + (i * 1.7) % 3,
      y: 10 + (i % 3) * 1.4,
      z: Math.floor(i / 6) * 8 - 10,
      s: 4 + (i % 4),
    }));
  }, [dense]);
  return (
    <group>
      {items.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.55, 1]}>
          <spriteMaterial map={tex} color={tint} transparent opacity={dense ? 0.55 : 0.35} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}
