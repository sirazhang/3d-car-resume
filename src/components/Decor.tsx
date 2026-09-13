import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "../store";
import { preloadModel } from "../setupGltf";

preloadModel("/models/cloud.glb");
preloadModel("/models/cloud-double.glb");
preloadModel("/models/balloon1.glb");
preloadModel("/models/balloon2.glb");
preloadModel("/models/tulips.glb");
preloadModel("/models/moon.glb");

function cloneScene(src: THREE.Object3D, asCloud = false) {
  const c = src.clone(true);
  c.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = false;
    m.receiveShadow = false;
    if (asCloud) {
      const tex = (m.material as THREE.MeshStandardMaterial)?.map ?? null;
      m.material = new THREE.MeshBasicMaterial({
        map: tex,
        color: "#ffffff",
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
    }
  });
  return c;
}

type Floater = {
  pos: [number, number, number];
  scale: number;
  rot: number;
  amp: number;
  speed: number;
  phase: number;
  kind?: "single" | "double" | 0 | 1;
  drift?: number;
};

const CLOUDS: Floater[] = [
  { pos: [-12.8, 10.6, 7.4], scale: 4.8, rot: Math.PI * 0.5, amp: 0.14, speed: 0.07, phase: 0.2, kind: "double", drift: 0.55 },
  { pos: [-9.6, 7.8, 11.2], scale: 1.08, rot: -0.35, amp: 0.12, speed: 0.09, phase: 1.1, kind: "single", drift: 0.42 },
  { pos: [6.8, 9.6, 13.4], scale: 1.18, rot: 0.4, amp: 0.1, speed: 0.08, phase: 2.0, kind: "single", drift: 0.48 },
  { pos: [14.2, 9.8, 4.8], scale: 1.5, rot: -0.25, amp: 0.13, speed: 0.07, phase: 1.6, kind: "single", drift: 0.5 },
  { pos: [13.6, 5.8, 10.8], scale: 0.78, rot: 0.55, amp: 0.1, speed: 0.1, phase: 2.5, kind: "single", drift: 0.38 },
  { pos: [-4.8, 11.4, -13.6], scale: 1.32, rot: 0.7, amp: 0.14, speed: 0.06, phase: 0.8, kind: "single", drift: 0.52 },
  { pos: [-5.4, 8.2, 4.1], scale: 1.02, rot: 0.22, amp: 0.1, speed: 0.08, phase: 0.5, kind: "single", drift: 0.26 },
  { pos: [4.6, 7.4, 2.4], scale: 0.9, rot: -0.38, amp: 0.09, speed: 0.09, phase: 1.8, kind: "single", drift: 0.22 },
];

const BALLOONS: Floater[] = [
  { pos: [-7.4, 8.6, 5.4], scale: 0.86, rot: 0.08, amp: 0.28, speed: 0.14, phase: 0.3, kind: 0 },
  { pos: [6.2, 8.2, 1.8], scale: 0.62, rot: -0.14, amp: 0.24, speed: 0.12, phase: 1.5, kind: 1 },
  { pos: [8.8, 5.8, 4.6], scale: 0.92, rot: 0.18, amp: 0.26, speed: 0.16, phase: 2.2, kind: 0 },
];

function CloudItem({
  item,
  obj,
}: {
  item: Floater;
  obj: THREE.Object3D;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.x = item.pos[0] + Math.sin(t * (item.speed * 0.35) + item.phase) * (item.drift ?? 0.3);
    g.position.y = item.pos[1] + Math.sin(t * item.speed + item.phase) * item.amp;
    g.position.z = item.pos[2] + Math.cos(t * (item.speed * 0.28) + item.phase) * (item.drift ?? 0.3) * 0.4;
    g.rotation.y = item.rot + t * 0.03;
  });
  return (
    <group ref={ref} position={item.pos} scale={item.scale} rotation={[0, item.rot, 0]}>
      <primitive object={obj} />
    </group>
  );
}

function BalloonItem({
  item,
  obj,
}: {
  item: Floater;
  obj: THREE.Object3D;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.position.y = item.pos[1] + Math.sin(t * item.speed + item.phase) * item.amp;
    g.rotation.y = item.rot + Math.sin(t * 0.12 + item.phase) * 0.12;
  });
  return (
    <group ref={ref} position={item.pos} scale={item.scale} rotation={[0, item.rot, 0]}>
      <primitive object={obj} />
    </group>
  );
}

export function RoofTulips() {
  const { scene } = useGLTF("/models/tulips.glb", "/draco/", false);
  const obj = useMemo(() => cloneScene(scene), [scene]);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 11.7 + Math.sin(clock.getElapsedTime() * 0.6) * 0.04;
  });
  return (
    <group ref={ref} position={[0, 11.7, 0]} scale={1.35}>
      <primitive object={obj} />
    </group>
  );
}

export function CloudField() {
  const single = useGLTF("/models/cloud.glb", "/draco/", false);
  const dbl = useGLTF("/models/cloud-double.glb", "/draco/", false);
  const theme = useApp((s) => s.theme);
  const clones = useMemo(
    () => CLOUDS.map((it) => cloneScene(it.kind === "double" ? dbl.scene : single.scene, true)),
    [single.scene, dbl.scene],
  );
  if (theme === "night") return null;
  return (
    <group>
      {CLOUDS.map((it, i) => (
        <CloudItem key={i} item={it} obj={clones[i]} />
      ))}
    </group>
  );
}

export function BalloonField() {
  const a = useGLTF("/models/balloon1.glb", "/draco/", false);
  const b = useGLTF("/models/balloon2.glb", "/draco/", false);
  const theme = useApp((s) => s.theme);
  const clones = useMemo(
    () => BALLOONS.map((it) => cloneScene(it.kind === 1 ? b.scene : a.scene)),
    [a.scene, b.scene],
  );
  if (theme === "night") return null;
  return (
    <group>
      {BALLOONS.map((it, i) => (
        <BalloonItem key={i} item={it} obj={clones[i]} />
      ))}
    </group>
  );
}

export function Moon() {
  const { scene } = useGLTF("/models/moon.glb", "/draco/", false);
  const theme = useApp((s) => s.theme);
  const obj = useMemo(() => cloneScene(scene), [scene]);
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = 13.2 + Math.sin(clock.getElapsedTime() * 0.22) * 0.12;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  if (theme !== "night") return null;
  return (
    <group ref={ref} position={[-5.4, 12.4, -3.2]} scale={1.7}>
      <primitive object={obj} />
      <pointLight color="#ffe6b0" intensity={3.8} distance={36} />
    </group>
  );
}

const STAR_COUNT = 420;
const METEOR_COUNT = 4;

export function NightSky() {
  const theme = useApp((s) => s.theme);
  const stars = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const col = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 28 + Math.random() * 42;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.85 + 0.12;
      pos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.55 + 8;
      pos[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
      const w = 0.75 + Math.random() * 0.25;
      col[i * 3] = w;
      col[i * 3 + 1] = w * 0.95;
      col[i * 3 + 2] = 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return geo;
  }, []);

  const milky = useMemo(() => {
    const n = 180;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      pos[i * 3] = (u - 0.5) * 70 + (Math.random() - 0.5) * 4;
      pos[i * 3 + 1] = 10 + Math.sin(u * Math.PI) * 8 + (Math.random() - 0.5) * 2.4;
      pos[i * 3 + 2] = -18 - u * 8 + (Math.random() - 0.5) * 6;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const meteors = useMemo(
    () =>
      Array.from({ length: METEOR_COUNT }, (_, i) => ({
        origin: new THREE.Vector3(10 + i * 4, 16 + i, -12 - i * 2),
        dir: new THREE.Vector3(-1.6, -0.55, 0.4).normalize(),
        speed: 9 + i * 1.4,
        delay: i * 3.2,
        len: 2.4,
      })),
    [],
  );
  const meteorRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meteors.forEach((m, i) => {
      const mesh = meteorRefs.current[i];
      if (!mesh) return;
      const cycle = 7.5;
      const u = ((t + m.delay) % cycle) / cycle;
      const flying = u < 0.28;
      mesh.visible = flying;
      if (!flying) return;
      const k = u / 0.28;
      mesh.position.copy(m.origin).addScaledVector(m.dir, k * m.speed * 3.2);
      mesh.lookAt(mesh.position.clone().add(m.dir));
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85;
    });
  });

  if (theme !== "night") return null;
  return (
    <group>
      <points geometry={stars}>
        <pointsMaterial size={0.12} vertexColors transparent opacity={0.92} depthWrite={false} sizeAttenuation />
      </points>
      <points geometry={milky}>
        <pointsMaterial size={0.22} color="#c9d6ff" transparent opacity={0.35} depthWrite={false} sizeAttenuation />
      </points>
      {meteors.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meteorRefs.current[i] = el;
          }}
        >
          <capsuleGeometry args={[0.04, 1.6, 4, 8]} />
          <meshBasicMaterial color="#e8f0ff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
