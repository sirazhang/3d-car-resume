import { useMemo } from "react";
import * as THREE from "three";
import { useApp } from "../store";

const SHOPS: { id: string; color: string; pos: [number, number, number] }[] = [
  { id: "studio", color: "#ffd166", pos: [0.78, 1.55, 2.93] },
  { id: "school", color: "#ffd166", pos: [0.0, 2.85, -2.82] },
  { id: "library", color: "#4ecdc4", pos: [-0.92, 4.15, 2.45] },
  { id: "tech", color: "#5b8def", pos: [-0.11, 6.85, 2.13] },
  { id: "movie", color: "#ef5da8", pos: [0.17, 9.55, 1.66] },
];

export function ShopGlow() {
  const theme = useApp((s) => s.theme);
  const mats = useMemo(
    () =>
      SHOPS.map((s) => ({
        ...s,
        col: new THREE.Color(s.color),
      })),
    [],
  );

  if (theme !== "night") return null;
  return (
    <group>
      {mats.map((s) => (
        <group key={s.id} position={s.pos}>
          <pointLight color={s.color} intensity={2.4} distance={5.2} decay={2} />
          <mesh>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color={s.color} transparent opacity={0.45} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
