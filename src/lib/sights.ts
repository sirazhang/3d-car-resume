export type SightId = "bread" | "bouquet" | "movie" | null;

const WINDOWS: { id: Exclude<SightId, null>; a: number; b: number }[] = [
  { id: "bouquet", a: 0.018, b: 0.085 },
  { id: "bread", a: 0.238, b: 0.318 },
  { id: "movie", a: 0.718, b: 0.805 },
];

export function sightAt(t: number): SightId {
  for (const w of WINDOWS) {
    if (t >= w.a && t <= w.b) return w.id;
  }
  return null;
}

export const MOVIE_PHOTOS = Array.from({ length: 15 }, (_, i) => `/photos/photo${i + 1}.jpg`);
