import type { ThemeId } from "../store";
import * as THREE from "three";

export type ThemeLook = {
  sky: [string, string];
  fog: string;
  fogNear: number;
  fogFar: number;
  sunColor: string;
  sunIntensity: number;
  sunPos: [number, number, number];
  ambient: string;
  ambientIntensity: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  ground: string;
  bloom: number;
  envPreset: "city" | "night" | "sunset";
};

export const THEME_LOOK: Record<ThemeId, ThemeLook> = {
  day: {
    sky: ["#8FBFD8", "#DCEBF0"],
    fog: "#DCEBF0",
    fogNear: 70,
    fogFar: 220,
    sunColor: "#ffe6d2",
    sunIntensity: 1.7,
    sunPos: [10, 16, 8],
    ambient: "#F4F3EE",
    ambientIntensity: 0.78,
    hemiSky: "#8FBFD8",
    hemiGround: "#F4F3EE",
    hemiIntensity: 0.9,
    ground: "#F4F3EE",
    bloom: 0.12,
    envPreset: "city",
  },
  night: {
    sky: ["#0b1024", "#1c2758"],
    fog: "#10162e",
    fogNear: 22,
    fogFar: 80,
    sunColor: "#c9d6ff",
    sunIntensity: 0.28,
    sunPos: [-8, 22, -6],
    ambient: "#1a2448",
    ambientIntensity: 0.42,
    hemiSky: "#24305e",
    hemiGround: "#0c101c",
    hemiIntensity: 0.55,
    ground: "#12182c",
    bloom: 0.55,
    envPreset: "night",
  },
};

export function fogColor(theme: ThemeId) {
  return new THREE.Color(THEME_LOOK[theme].fog);
}
