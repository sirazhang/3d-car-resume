import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { sampleAt } from "../lib/path";
import { THEME_LOOK } from "../lib/themes";
import { useApp } from "../store";
import { Car } from "./Car";
import { BalloonField, CloudField, Moon, NightSky, RoofTulips } from "./Decor";
import { EnvironmentWorld, IdlePad } from "./Environment";
import { GlowRings } from "./GlowRings";
import { StreetLamps } from "./StreetLamps";
import { ShopGlow } from "./ShopGlow";
import type { Trigger } from "../lib/path";
import { preloadModel } from "../setupGltf";

preloadModel("/models/tower.glb?v=3");

const CAFE_LOOK = new THREE.Vector3(-1.05, 1.35, 2.86);
const INTRO_DURATION = 2.8;

function cloneScene(src: THREE.Object3D) {
  const c = src.clone(true);
  c.traverse((o) => {
    const name = (o.name || "").toLowerCase();
    if (name === "ground" || name.includes("ground floor footing")) {
      o.visible = false;
      return;
    }
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = false;
      m.receiveShadow = true;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 0.38;
    }
  });
  return c;
}

function Tower({ onReady }: { onReady: (obj: THREE.Object3D) => void }) {
  const { scene } = useGLTF("/models/tower.glb?v=2", "/draco/", false);
  const obj = useMemo(() => cloneScene(scene), [scene]);
  const wrap = useRef<THREE.Group>(null);
  useEffect(() => {
    onReady(obj);
  }, [obj, onReady]);
  useFrame((_, dt) => {
    const g = wrap.current;
    if (!g) return;
    const { introPlaying } = useApp.getState();
    const target = introPlaying ? Math.PI * 0.55 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, introPlaying ? 1.6 : 4, dt);
  });
  return (
    <group ref={wrap}>
      <primitive object={obj} />
    </group>
  );
}

function FollowCam() {
  const { camera } = useThree();
  const introT = useRef(0);
  const started = useRef(false);
  const fromPos = useRef(new THREE.Vector3());
  const fromQuat = useRef(new THREE.Quaternion());

  useFrame((_, dt) => {
    const { hasDriven, introPlaying, returning, t, offset } = useApp.getState();
    if (!hasDriven) {
      started.current = false;
      introT.current = 0;
      if (returning) {
        const idlePos = new THREE.Vector3(8.4, 3.6, 13.2);
        const idleLook = new THREE.Vector3(0, 4.4, 0);
        camera.position.lerp(idlePos, 1 - Math.pow(0.08, dt * 60));
        const m = new THREE.Matrix4().lookAt(camera.position, idleLook, new THREE.Vector3(0, 1, 0));
        camera.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), 1 - Math.pow(0.1, dt * 60));
        if (camera.position.distanceTo(idlePos) < 0.12) {
          useApp.setState({ returning: false });
        }
      }
      return;
    }

    if (introPlaying) {
      if (!started.current) {
        started.current = true;
        introT.current = 0;
        fromPos.current.copy(camera.position);
        fromQuat.current.copy(camera.quaternion);
      }
      introT.current = Math.min(1, introT.current + dt / INTRO_DURATION);
      const k = 1 - Math.pow(1 - introT.current, 3);

      const { pos, tan } = sampleAt(0, 0);
      const orbit = new THREE.Vector3(
        Math.sin(k * Math.PI * 0.55) * 4.2,
        2.1 - k * 0.35,
        Math.cos(k * Math.PI * 0.55) * 4.8,
      );
      const cafeCam = CAFE_LOOK.clone().add(orbit);
      const followBack = pos.clone().add(tan.clone().multiplyScalar(-3.2)).add(new THREE.Vector3(0, 1.45, 0));
      const desired = cafeCam.lerp(followBack, Math.max(0, (k - 0.55) / 0.45));
      camera.position.lerpVectors(fromPos.current, desired, k);

      const lookA = CAFE_LOOK.clone().add(new THREE.Vector3(0, 0.2, 0));
      const lookB = pos.clone().add(tan.clone().multiplyScalar(2.2)).add(new THREE.Vector3(0, 0.65, 0));
      const look = lookA.lerp(lookB, Math.max(0, (k - 0.45) / 0.55));
      const m = new THREE.Matrix4().lookAt(camera.position, look, new THREE.Vector3(0, 1, 0));
      camera.quaternion.slerp(new THREE.Quaternion().setFromRotationMatrix(m), 0.18);

      if (introT.current >= 1) useApp.getState().endIntro();
      return;
    }

    const { pos, tan } = sampleAt(t, offset);
    const back = tan.clone().multiplyScalar(-3.2);
    const desired = pos.clone().add(back).add(new THREE.Vector3(0, 1.45, 0));
    camera.position.lerp(desired, 1 - Math.pow(0.12, dt * 60));
    const look = pos.clone().add(tan.clone().multiplyScalar(2.2)).add(new THREE.Vector3(0, 0.65, 0));
    const m = new THREE.Matrix4().lookAt(camera.position, look, new THREE.Vector3(0, 1, 0));
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    camera.quaternion.slerp(q, 1 - Math.pow(0.14, dt * 60));
  });
  return null;
}

function Ground() {
  return <IdlePad />;
}

export function World({ triggers }: { triggers: Trigger[] }) {
  const theme = useApp((s) => s.theme);
  const look = THEME_LOOK[theme];
  const [towerObj, setTowerObj] = useState<THREE.Object3D | null>(null);
  const { scene, gl } = useThree();

  useEffect(() => {
    if (theme === "night") {
      const bg = new THREE.Color("#0b1024");
      scene.background = bg;
      gl.setClearColor(bg, 1);
    } else {
      scene.background = null;
      gl.setClearColor(0x000000, 0);
    }
  }, [theme, scene, gl]);

  return (
    <>
      <fog attach="fog" args={[look.fog, look.fogNear, look.fogFar]} />
      <hemisphereLight args={[look.hemiSky, look.hemiGround, look.hemiIntensity]} />
      <ambientLight intensity={look.ambientIntensity} color={look.ambient} />
      <directionalLight
        position={look.sunPos}
        intensity={look.sunIntensity}
        color={look.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />
      {theme === "night" ? (
        <pointLight position={[0, 7, 0]} intensity={0.4} distance={24} color="#ffc089" />
      ) : null}
      <EnvironmentWorld />
      <Ground />
      <Tower onReady={setTowerObj} />
      <StreetLamps tower={towerObj} />
      <ShopGlow />
      <RoofTulips />
      <CloudField />
      <BalloonField />
      <Moon />
      <NightSky />
      <Car triggers={triggers} />
      <GlowRings triggers={triggers} />
      <FollowCam />
    </>
  );
}
