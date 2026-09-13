import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { World } from "./components/World";
import { Hud } from "./components/Hud";
import { OverlayRoot } from "./components/Panels";
import { SightOverlay } from "./components/SightOverlay";
import { AudioLayer } from "./components/AudioLayer";
import { loadPath, type Trigger } from "./lib/path";
import { THEME_LOOK } from "./lib/themes";
import { useApp } from "./store";
import { t } from "./lib/i18n";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="w-64 rounded-2xl bg-white/80 px-5 py-4 text-center text-slate-800 shadow-xl backdrop-blur">
        <div className="font-display text-lg">Entering Spiral Town</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full bg-roseink" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-1 text-xs text-slate-500">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}

function Post() {
  const theme = useApp((s) => s.theme);
  const look = THEME_LOOK[theme];
  if (theme !== "night") return null;
  return (
    <EffectComposer disableNormalPass>
      <Bloom intensity={look.bloom} luminanceThreshold={0.72} mipmapBlur />
      <Vignette eskil={false} offset={0.28} darkness={0.55} />
    </EffectComposer>
  );
}

function ThemeSwitch() {
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  return (
    <div className="theme-switch" role="radiogroup" aria-label="theme">
      <button
        className={`theme-seg ${theme === "day" ? "on" : ""}`}
        onClick={() => setTheme("day")}
        aria-label="白天"
        title="白天"
      >
        <span className="theme-ico sun" />
      </button>
      <button
        className={`theme-seg ${theme === "night" ? "on" : ""}`}
        onClick={() => setTheme("night")}
        aria-label="夜晚"
        title="夜晚"
      >
        <span className="theme-ico moon" />
      </button>
    </div>
  );
}

export default function App() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [ready, setReady] = useState(false);
  const hasDriven = useApp((s) => s.hasDriven);
  const returning = useApp((s) => s.returning);
  const theme = useApp((s) => s.theme);
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);

  useEffect(() => {
    loadPath().then((d) => {
      setTriggers(d.triggers);
      setReady(true);
    });
  }, []);

  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          theme === "night"
            ? "linear-gradient(180deg, #0b1024 0%, #1c2758 42%, #2a2148 72%, #12182c 100%)"
            : "linear-gradient(180deg, #8FBFD8 0%, #DCEBF0 52%, #F4F3EE 100%)",
        backgroundColor: theme === "day" ? "#DCEBF0" : "#0b1024",
      }}
    >
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [8.4, 3.6, 13.2], fov: 38, near: 0.1, far: 2400 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <Suspense fallback={<Loader />}>
          <World triggers={ready ? triggers : []} />
        </Suspense>
        <Post />
        {!hasDriven && !returning && (
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            minDistance={9}
            maxDistance={24}
            target={[0, 4.4, 0]}
            maxPolarAngle={Math.PI / 2.22}
            enableDamping
            dampingFactor={0.08}
          />
        )}
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/70 px-4 py-2 shadow backdrop-blur">
        <div className="font-display text-sm font-semibold text-slate-900">
          {t(lang, "title")}
        </div>
        <div className="text-xs text-slate-500">{t(lang, "subtitle")}</div>
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 z-30 flex items-center gap-2">
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-800 shadow backdrop-blur hover:bg-white"
        >
          {lang === "zh" ? "EN" : "中文"}
        </button>
        <ThemeSwitch />
      </div>

      <AudioLayer />
      <Hud />
      <SightOverlay />
      <OverlayRoot />
    </div>
  );
}
