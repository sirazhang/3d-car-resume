import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "../store";
import { preloadModel } from "../setupGltf";

preloadModel("/models/environment.glb");

const TOP = new THREE.Color("#8FBFD8");
const HORIZON = new THREE.Color("#DCEBF0");
const SEA = new THREE.Color("#F4F3EE");
const RIDGE = new THREE.Color("#A6BDC6");
const RIDGE_LIT = new THREE.Color("#c5d6dc");

function paintSky(mesh: THREE.Mesh) {
  const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  mesh.geometry = geo;
  const pos = geo.getAttribute("position");
  const col = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = THREE.MathUtils.smoothstep(-80, 900, y);
    c.copy(HORIZON).lerp(TOP, t);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  geo.setAttribute("color", col);
}

function paintSolid(mesh: THREE.Mesh, a: THREE.Color, b: THREE.Color, y0: number, y1: number) {
  const geo = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  mesh.geometry = geo;
  const pos = geo.getAttribute("position");
  const col = new THREE.BufferAttribute(new Float32Array(pos.count * 3), 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((pos.getY(i) - y0) / Math.max(0.001, y1 - y0), 0, 1);
    c.copy(a).lerp(b, t);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  geo.setAttribute("color", col);
}

function basic(color = "#ffffff", extra: Partial<THREE.MeshBasicMaterialParameters> = {}) {
  return new THREE.MeshBasicMaterial({
    vertexColors: true,
    color,
    side: THREE.DoubleSide,
    fog: true,
    ...extra,
  });
}

export function EnvironmentWorld() {
  const { scene } = useGLTF("/models/environment.glb", "/draco/", false);
  const theme = useApp((s) => s.theme);
  const cloudSpin = useRef<THREE.Group>(null);

  const { root, clouds } = useMemo(() => {
    const cloned = scene.clone(true);
    const cloudRoot = new THREE.Group();
    const keep = new THREE.Group();

    cloned.updateMatrixWorld(true);
    const children = [...cloned.children];
    for (const child of children) {
      const name = child.name || "";
      if (name.startsWith("ENV_cloud_near") || name === "ENV_near_hills") {
        child.removeFromParent();
        continue;
      }
      child.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.castShadow = false;
        m.receiveShadow = false;
        const n = m.name || name;
        if (n === "ENV_Sky_dome") {
          paintSky(m);
          m.material = basic("#ffffff", { fog: false, depthWrite: false });
          m.renderOrder = -40;
          m.frustumCulled = false;
        } else if (n === "ENV_Sun_disc") {
          m.material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            color: "#ffe7b8",
            fog: false,
            toneMapped: false,
            side: THREE.DoubleSide,
          });
          m.frustumCulled = false;
        } else if (n === "ENV_Cloud_sea") {
          paintSolid(m, SEA, new THREE.Color("#ffffff"), -3.4, -1);
          m.material = basic("#ffffff", { depthWrite: true });
          m.position.y += 1.05;
        } else if (n === "ENV_mid_ridge" || n === "ENV_far_range") {
          paintSolid(m, RIDGE, RIDGE_LIT, n === "ENV_far_range" ? -16 : -9, n === "ENV_far_range" ? 56 : 28);
          m.material = basic("#ffffff");
        } else if (n.startsWith("ENV_cloud_")) {
          paintSolid(m, new THREE.Color("#eef1f4"), new THREE.Color("#ffffff"), -4, 8);
          m.material = basic("#ffffff", { transparent: true, opacity: 0.92, depthWrite: false });
        }
      });
      if (name.startsWith("ENV_cloud_")) cloudRoot.add(child);
      else keep.add(child);
    }
    return { root: keep, clouds: cloudRoot };
  }, [scene]);

  useFrame((_, dt) => {
    if (cloudSpin.current) cloudSpin.current.rotation.y += dt * 0.0035;
  });

  if (theme === "night") return null;
  return (
    <group>
      <primitive object={root} />
      <group ref={cloudSpin}>
        <primitive object={clouds} />
      </group>
    </group>
  );
}

export function IdlePad() {
  const theme = useApp((s) => s.theme);
  if (theme === "night") {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.95, 0.01, 5.2]} receiveShadow>
        <circleGeometry args={[4.6, 48]} />
        <meshStandardMaterial color="#1a2238" roughness={0.96} />
      </mesh>
    );
  }
  return (
    <group position={[-5.95, 0, 5.2]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[5.6, 56]} />
        <meshStandardMaterial color="#efeae0" roughness={0.97} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, 0.035, -0.08]}>
        <circleGeometry args={[3.9, 48]} />
        <meshStandardMaterial color="#f7f4ee" roughness={0.98} metalness={0} />
      </mesh>
    </group>
  );
}
