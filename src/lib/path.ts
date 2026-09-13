import * as THREE from "three";

export type PathPoint = { x: number; y: number; z: number; r: number; ang: number };

export type Trigger = {
  id: string;
  name: string;
  panel: "education" | "publication" | "projects" | "contact";
  x: number;
  y: number;
  z: number;
  shopX: number;
  shopY: number;
  shopZ: number;
  t: number;
  radius: number;
};

export type PathData = {
  path: PathPoint[];
  shops: { id: string; name: string; x: number; y: number; z: number; panel: string | null }[];
  triggers: Trigger[];
};

let cached: PathData | null = null;
let curve: THREE.CatmullRomCurve3 | null = null;

export async function loadPath(): Promise<PathData> {
  if (cached) return cached;
  const res = await fetch("/path.json?v=tower5");
  cached = (await res.json()) as PathData;
  const pts = cached.path.map((p) => new THREE.Vector3(p.x, p.z, -p.y));
  curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.08);
  return cached;
}

export function getCurve(): THREE.CatmullRomCurve3 {
  if (!curve) throw new Error("path not loaded");
  return curve;
}

/** 道路加宽后，沿塔心径向把车推到跑道中央（再往外、靠近护栏一侧） */
export const LANE_OUT = 1.22;

export function sampleAt(t: number, offset = 0) {
  const c = getCurve();
  const u = THREE.MathUtils.clamp(t, 0, 1);
  const pos = c.getPointAt(u);
  const tan = c.getTangentAt(u).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(tan, up).normalize();
  if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
  const radial = new THREE.Vector3(pos.x, 0, pos.z);
  if (radial.lengthSq() > 1e-6) {
    radial.normalize();
    pos.addScaledVector(radial, LANE_OUT);
  }
  pos.addScaledVector(right, offset);
  const look = pos.clone().add(tan);
  const quat = new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().lookAt(pos, look, up),
  );
  return { pos, tan, right, quat };
}
