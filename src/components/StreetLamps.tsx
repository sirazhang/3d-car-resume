import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useApp } from "../store";
import { CAR_WORLD, CAR_DRIVING } from "../lib/carPos";

type Lamp = {
  pos: THREE.Vector3;
  mat: THREE.MeshStandardMaterial;
  restEmissive: THREE.Color;
  restIntensity: number;
};

const REACH = 3.6; // 小车靠近这么远才亮
const FADE = 1.4;

export function StreetLamps({ tower }: { tower: THREE.Object3D | null }) {
  const theme = useApp((s) => s.theme);
  const night = theme === "night";
  const lamps = useMemo<Lamp[]>(() => {
    if (!tower) return [];
    const out: Lamp[] = [];
    tower.updateMatrixWorld(true);
    tower.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const n = m.name || "";
      if (!n.startsWith("Luminous lantern")) return;
      // 每个灯头独立材质，方便改 emissive
      const src = m.material as THREE.MeshStandardMaterial;
      if (!src) return;
      const mat = src.clone();
      m.material = mat;
      const box = new THREE.Box3().setFromObject(m);
      const pos = box.getCenter(new THREE.Vector3());
      out.push({
        pos,
        mat,
        restEmissive: (mat.emissive ? mat.emissive.clone() : new THREE.Color(0x000000)),
        restIntensity: mat.emissiveIntensity ?? 0,
      });
    });
    return out;
  }, [tower]);

  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const levels = useRef<number[]>([]);

  useEffect(() => {
    levels.current = lamps.map(() => 0);
  }, [lamps]);

  useFrame((_, dt) => {
    const night = theme === "night";
    const driving = CAR_DRIVING.value;
    lamps.forEach((lp, i) => {
      let target = 0;
      if (night && driving) {
        const d = lp.pos.distanceTo(CAR_WORLD);
        target = d < REACH ? THREE.MathUtils.clamp(1 - d / REACH, 0, 1) : 0;
      }
      const cur = levels.current[i] ?? 0;
      const next = THREE.MathUtils.damp(cur, target, FADE, dt);
      levels.current[i] = next;
      lp.mat.emissive.setRGB(
        THREE.MathUtils.lerp(lp.restEmissive.r, 1.0, next),
        THREE.MathUtils.lerp(lp.restEmissive.g, 0.88, next),
        THREE.MathUtils.lerp(lp.restEmissive.b, 0.55, next),
      );
      lp.mat.emissiveIntensity = THREE.MathUtils.lerp(lp.restIntensity, 4.2, next);
      const L = lights.current[i];
      if (L) {
        L.intensity = next * 2.4;
        L.visible = next > 0.02;
      }
    });
  });

  if (!night) return null;

  return (
    <group>
      {lamps.map((lp, i) => (
        <pointLight
          key={i}
          ref={(el) => {
            lights.current[i] = el;
          }}
          position={lp.pos.toArray()}
          color="#ffd8a0"
          intensity={0}
          distance={4.8}
          decay={2}
        />
      ))}
    </group>
  );
}
