import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sampleAt, type Trigger } from "../lib/path";

const SHOP_COLOR: Record<string, string> = {
  school: "#ffd166",
  library: "#4ecdc4",
  tech: "#5b8def",
};

function worldOf(tr: Trigger): [number, number, number] {
  try {
    const { pos } = sampleAt(tr.t, 0);
    return [pos.x, pos.y + 0.035, pos.z];
  } catch {
    return [tr.x, tr.z + 0.035, -tr.y];
  }
}

function DualRing({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  const g = useRef<THREE.Group>(null);
  const col = useMemo(() => new THREE.Color(color), [color]);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const k = 0.88 + Math.sin(clock.getElapsedTime() * 1.6) * 0.1;
    g.current.scale.setScalar(k);
  });
  return (
    <group ref={g} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.62, 0.86, 48]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.34, 0.44, 48]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-4}
          polygonOffsetUnits={-4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export function GlowRings({ triggers }: { triggers: Trigger[] }) {
  return (
    <group>
      {triggers
        .filter((tr) => tr.id !== "summit")
        .map((tr) => (
          <DualRing
            key={tr.id}
            position={worldOf(tr)}
            color={SHOP_COLOR[tr.id] || "#ffffff"}
          />
        ))}
    </group>
  );
}
