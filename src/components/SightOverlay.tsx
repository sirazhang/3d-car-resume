import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useApp } from "../store";
import { MOVIE_PHOTOS } from "../lib/sights";
import { preloadModel } from "../setupGltf";

preloadModel("/models/bread.glb");
preloadModel("/models/bouquet.glb");

function PropModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, "/draco/", false);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = false;
        m.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const max = Math.max(size.x, size.y, size.z, 0.001);
    c.scale.setScalar(1.9 / max);
    const fitted = new THREE.Box3().setFromObject(c);
    const center = fitted.getCenter(new THREE.Vector3());
    c.position.sub(center);
    return c;
  }, [scene]);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.55;
  });
  return (
    <group ref={ref}>
      <primitive object={obj} />
    </group>
  );
}

function PropStage({ url }: { url: string }) {
  return (
    <div className="sight-stage">
      <Canvas camera={{ position: [0, 0.2, 3.2], fov: 32 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={1.15} />
        <directionalLight position={[2.4, 3.2, 2]} intensity={1.6} />
        <hemisphereLight args={["#fff6e8", "#c9b8a6", 0.7]} />
        <Suspense fallback={null}>
          <PropModel url={url} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function MovieReel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % MOVIE_PHOTOS.length), 1600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="movie-reel">
      <div className="movie-reel-bar" />
      <img src={MOVIE_PHOTOS[i]} alt="" />
      <div className="movie-reel-bar" />
      <div className="movie-reel-cap">
        {i + 1} / {MOVIE_PHOTOS.length}
      </div>
    </div>
  );
}

export function SightOverlay() {
  const sight = useApp((s) => s.sight);
  const togglePause = useApp((s) => s.togglePause);
  if (!sight) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[25] flex items-center justify-center">
      <div className="pointer-events-auto" onClick={togglePause}>
        {sight === "bread" && <PropStage url="/models/bread.glb" />}
        {sight === "bouquet" && <PropStage url="/models/bouquet.glb" />}
        {sight === "movie" && <MovieReel />}
      </div>
    </div>
  );
}
