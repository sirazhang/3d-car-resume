import { useMemo, useRef } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useApp, DRIVE_SCALE, IDLE_SCALE, BASE_SPEED } from "../store";
import { sampleAt, type Trigger } from "../lib/path";
import { preloadModel } from "../setupGltf";
import { CAR_WORLD, CAR_DRIVING } from "../lib/carPos";

preloadModel("/models/car.glb");

function cloneScene(src: THREE.Object3D) {
  const c = src.clone(true);
  c.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return c;
}

const CAR_HALF_H = 0.32;
const IDLE_POS = new THREE.Vector3(-5.55, 0.62, 5.55);
const IDLE_EULER = new THREE.Euler(0, -Math.PI / 2, 0);

export function Car({ triggers }: { triggers: Trigger[] }) {
  const { scene } = useGLTF("/models/car.glb", "/draco/", false);
  const obj = useMemo(() => cloneScene(scene), [scene]);
  const theme = useApp((s) => s.theme);
  const group = useRef<THREE.Group>(null);
  const idleQuat = useMemo(() => new THREE.Quaternion().setFromEuler(IDLE_EULER), []);
  const lastT = useRef(0);
  const lastPanel = useRef<string | null>(null);
  const started = useRef(false);
  const bounce = useRef(0);
  const nightMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const sorted = useMemo(
    () => [...triggers].sort((a, b) => a.t - b.t),
    [triggers],
  );

  useMemo(() => {
    const mats: THREE.MeshStandardMaterial[] = [];
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const src = m.material as THREE.MeshStandardMaterial;
      if (!src) return;
      const mat = src.clone();
      m.material = mat;
      mats.push(mat);
    });
    nightMats.current = mats;
  }, [obj]);

  useFrame((_, dt) => {
    const st = useApp.getState();
    if (!group.current) return;
    const g = group.current;
    bounce.current += dt;

    const night = st.theme === "night";
    for (const mat of nightMats.current) {
      if (night) {
        mat.emissive.set("#ff4d8d");
        mat.emissiveIntensity = 0.08;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0;
      }
    }

    if (!st.hasDriven) {
      started.current = false;
      lastT.current = 0;
      lastPanel.current = null;
      const yaw = Math.sin(bounce.current * 0.9) * 0.03;
      const target = IDLE_POS.clone();
      g.position.lerp(target, 1 - Math.pow(0.12, dt * 60));
      const q = idleQuat.clone();
      q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
      g.quaternion.slerp(q, 1 - Math.pow(0.12, dt * 60));
      const s = THREE.MathUtils.damp(g.scale.x, IDLE_SCALE, 6, dt);
      g.scale.setScalar(s);
      CAR_WORLD.copy(g.position);
      CAR_DRIVING.value = false;
      return;
    }

    if (st.introPlaying) {
      lastT.current = 0;
      lastPanel.current = null;
      const { pos, quat } = sampleAt(0, 0);
      pos.y += CAR_HALF_H * DRIVE_SCALE;
      g.position.lerp(pos, 1 - Math.pow(0.08, dt * 60));
      g.quaternion.slerp(quat, 1 - Math.pow(0.08, dt * 60));
      const s = THREE.MathUtils.damp(g.scale.x, DRIVE_SCALE, 3.2, dt);
      g.scale.setScalar(s);
      CAR_WORLD.copy(g.position);
      CAR_DRIVING.value = true;
      return;
    }

    started.current = true;

    let t = st.t;
    const last = sorted[sorted.length - 1];
    const topT = last?.panel === "contact" ? last.t : 1;
    if (!st.paused) {
      t = THREE.MathUtils.clamp(t + BASE_SPEED * 60 * dt * st.dir, 0, topT);
      for (const tr of sorted) {
        const a = lastT.current;
        const b = t;
        const crossed =
          st.dir === 1
            ? a < tr.t - 1e-6 && b >= tr.t - 1e-6
            : a > tr.t + 1e-6 && b <= tr.t + 1e-6;
        if (crossed) {
          t = tr.t;
          lastPanel.current = tr.id;
          useApp.getState().setT(t);
          useApp.getState().openPanel(tr.panel);
          break;
        }
      }
      if (st.dir === 1 && t >= topT - 1e-5) {
        t = topT;
        useApp.getState().setT(t);
        if (last?.panel === "contact" && st.panel !== "contact") {
          useApp.getState().openPanel("contact");
        } else {
          useApp.getState().setPaused(true);
        }
      } else if (st.dir === -1 && t <= 1e-5) {
        t = 0;
        useApp.getState().setPaused(true);
      }
      if (Math.abs(t - st.t) > 1e-6) useApp.getState().setT(t);
    }
    lastT.current = t;

    const { pos, quat } = sampleAt(t, 0);
    pos.y += CAR_HALF_H * DRIVE_SCALE;
    g.position.lerp(pos, 1 - Math.pow(0.18, dt * 60));
    g.quaternion.slerp(quat, 1 - Math.pow(0.18, dt * 60));
    const s = THREE.MathUtils.damp(g.scale.x, DRIVE_SCALE, 7, dt);
    g.scale.setScalar(s);
    CAR_WORLD.copy(g.position);
    CAR_DRIVING.value = true;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const st = useApp.getState();
    if (!st.hasDriven) st.goUp();
  };

  return (
    <group
      ref={group}
      scale={IDLE_SCALE}
      position={IDLE_POS.toArray()}
      onClick={onClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <primitive object={obj} rotation={[0, Math.PI, 0]} />
      {theme === "night" ? (
        <>
          <pointLight color="#ff6aa8" intensity={1.5} distance={3.6} position={[0, 0.35, 0]} />
          <pointLight color="#5ce1ff" intensity={0.8} distance={2.2} position={[0.55, 0.12, 0.7]} />
        </>
      ) : null}
    </group>
  );
}
