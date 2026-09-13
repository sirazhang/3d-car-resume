import { useEffect, useRef } from "react";
import { useApp, SUMMIT_T } from "../store";
import { t } from "../lib/i18n";

export function Hud() {
  const hasDriven = useApp((s) => s.hasDriven);
  const introPlaying = useApp((s) => s.introPlaying);
  const paused = useApp((s) => s.paused);
  const progress = useApp((s) => s.t);
  const panel = useApp((s) => s.panel);
  const introCard = useApp((s) => s.introCard);
  const lang = useApp((s) => s.lang);
  const theme = useApp((s) => s.theme);
  const goUp = useApp((s) => s.goUp);
  const goDown = useApp((s) => s.goDown);
  const needle = useRef<SVGLineElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space") {
        e.preventDefault();
        useApp.getState().togglePause();
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        useApp.getState().goUp();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        useApp.getState().goDown();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const st = useApp.getState();
      const el = needle.current;
      if (el) {
        const moving = st.hasDriven && !st.paused && !st.introPlaying && !st.panel;
        const ang = moving ? -70 + Math.sin(performance.now() / 180) * 18 + 70 : -70;
        el.setAttribute("transform", `rotate(${ang} 80 86)`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const atTop = progress >= SUMMIT_T - 0.004;
  const atBottom = progress <= 0.005;
  const fuel = Math.min(1, progress / SUMMIT_T);
  const canUp = !hasDriven || (!introPlaying && !atTop);
  const canDown = hasDriven && !introPlaying && !atBottom;
  const day = theme === "day";
  const track = day ? "#ead7c8" : "#16324a";
  const arc = day ? "#ffde59" : "#2ee6ff";
  const pin = day ? "#bb274d" : "#ff4fd8";
  const label = day ? "#bb274d" : "#8be9ff";

  return (
    <div className={`pointer-events-none absolute inset-0 z-20 ${panel || introCard ? "invisible" : ""}`}>
      {!hasDriven && (
        <div className="pointer-events-auto absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-4">
          <button onClick={goDown} disabled aria-label="向下行驶" className="drive-btn drive-btn-lg">
            <ArrowDown />
          </button>
          <div className="hud-idle">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-roseink">
              {t(lang, "controlsTitle")}
            </div>
            <div className="mt-1 text-[13px] leading-snug text-slate-700">{t(lang, "controlsIdle")}</div>
            <div className="mt-1 text-[11px] leading-snug text-slate-500">{t(lang, "controlsHint")}</div>
          </div>
          <button onClick={goUp} aria-label="向上行驶" className="drive-btn drive-btn-lg">
            <ArrowUp />
          </button>
        </div>
      )}

      {hasDriven && (
        <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-4">
          <button onClick={goDown} disabled={!canDown} aria-label="向下行驶" className="drive-btn drive-btn-lg">
            <ArrowDown />
          </button>
          <div className={day ? "fuel-gauge day" : "fuel-gauge night"}>
            <svg viewBox="0 0 160 118" className="h-[88px] w-[150px]">
              <path d="M18 94 A62 62 0 0 1 142 94" fill="none" stroke={track} strokeWidth="14" strokeLinecap="round" />
              <path d="M18 94 A62 62 0 0 1 142 94" fill="none" stroke={arc} strokeWidth="6" strokeLinecap="round" />
              <line
                ref={needle}
                x1="80"
                y1="86"
                x2="80"
                y2="32"
                stroke={pin}
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <circle cx="80" cy="86" r="6" fill={pin} />
              <text x="80" y="112" textAnchor="middle" fill={label} fontSize="11" fontFamily="ui-monospace, monospace">
                {paused ? "IDLE" : "DRIVE"}
              </text>
            </svg>
            <div className="fuel-bar">
              <div className="fuel-bar-fill" style={{ width: `${Math.round(fuel * 100)}%` }} />
            </div>
            <div className="fuel-pct">{Math.round(fuel * 100)}%</div>
          </div>
          <button onClick={goUp} disabled={!canUp} aria-label="向上行驶" className="drive-btn drive-btn-lg">
            <ArrowUp />
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowUp() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}
