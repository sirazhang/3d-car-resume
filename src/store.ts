import { create } from "zustand";
import { sightAt, type SightId } from "./lib/sights";
import { playCarStart, playShopBell } from "./lib/audio";

export type ThemeId = "day" | "night";
export type Lang = "en" | "zh";

export type PanelId = "education" | "publication" | "projects" | "contact" | null;

export const SUMMIT_T = 0.938;

interface AppState {
  t: number;
  dir: 1 | -1;
  speed: number;
  paused: boolean;
  offset: number;
  hasDriven: boolean;
  introPlaying: boolean;
  returning: boolean;
  introCard: boolean;
  sight: SightId;
  theme: ThemeId;
  lang: Lang;
  panel: PanelId;
  poster: string | null;
  keys: Record<string, boolean>;
  setKey: (code: string, down: boolean) => void;
  setT: (t: number) => void;
  setDir: (d: 1 | -1) => void;
  setSpeed: (s: number) => void;
  togglePause: () => void;
  setPaused: (v: boolean) => void;
  setOffset: (v: number) => void;
  markDriven: () => void;
  setTheme: (t: ThemeId) => void;
  setLang: (l: Lang) => void;
  openPanel: (p: PanelId) => void;
  closePanel: () => void;
  setPoster: (src: string | null) => void;
  goUp: () => void;
  goDown: () => void;
  endIntro: () => void;
  resetToStart: () => void;
  closeIntroCard: () => void;
}

export const BASE_SPEED = 0.0008;
export const OFFSET_MAX = 0.5;

export const DRIVE_SCALE = 0.68;
export const IDLE_SCALE = 3.45;

export const useApp = create<AppState>((set) => ({
  t: 0,
  dir: 1,
  speed: BASE_SPEED,
  paused: false,
  offset: 0,
  hasDriven: false,
  introPlaying: false,
  returning: false,
  introCard: false,
  sight: null,
  theme: "day",
  lang: "zh",
  panel: null,
  poster: null,
  keys: {},
  setKey: (code, down) =>
    set((s) => ({ keys: { ...s.keys, [code]: down } })),
  setT: (t) => set({ t }),
  setDir: (d) => set({ dir: d }),
  setSpeed: (s) => set({ speed: s }),
  togglePause: () =>
    set((s) => {
      if (!s.hasDriven || s.introPlaying || s.panel || s.introCard) return s;
      if (s.paused) return { paused: false, sight: null };
      return { paused: true, sight: sightAt(s.t) };
    }),
  setPaused: (v) => set((s) => ({ paused: v, sight: v ? s.sight : null })),
  setOffset: (v) => set({ offset: v }),
  markDriven: () => set({ hasDriven: true }),
  setTheme: (t) => set({ theme: t }),
  setLang: (l) => set({ lang: l }),
  openPanel: (p) => {
    playShopBell(p);
    set({ panel: p, paused: true, poster: null, sight: null, introCard: false });
  },
  closePanel: () => set({ panel: null, poster: null }),
  setPoster: (src) => set({ poster: src }),
  goUp: () =>
    set((s) => {
      if (!s.hasDriven) {
        playCarStart();
        return {
          hasDriven: true,
          introPlaying: true,
          returning: false,
          introCard: false,
          dir: 1 as const,
          paused: true,
          panel: null,
          poster: null,
          sight: null,
          t: 0,
        };
      }
      return {
        dir: 1 as const,
        paused: false,
        panel: null,
        poster: null,
        introCard: false,
        sight: null,
        t: Math.min(SUMMIT_T, s.t + 0.004),
      };
    }),
  goDown: () =>
    set((s) =>
      s.hasDriven && !s.introPlaying
        ? {
            dir: -1 as const,
            paused: false,
            panel: null,
            poster: null,
            introCard: false,
            sight: null,
            t: Math.max(0, s.t - 0.004),
          }
        : s,
    ),
  endIntro: () => set({ introPlaying: false, paused: true, introCard: true }),
  closeIntroCard: () => set({ introCard: false }),
  resetToStart: () =>
    set({
      panel: null,
      poster: null,
      hasDriven: false,
      introPlaying: false,
      returning: true,
      introCard: false,
      sight: null,
      t: 0,
      dir: 1,
      paused: false,
      offset: 0,
    }),
}));
