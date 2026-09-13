const SHOP_PANELS = new Set(["education", "publication", "projects"]);

function play(src: string, volume: number) {
  const a = new Audio(src);
  a.volume = volume;
  void a.play().catch(() => {});
}

let bgm: HTMLAudioElement | null = null;
let unlocked = false;

export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  if (!bgm) {
    bgm = new Audio("/audio/bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.13;
  }
  void bgm.play().catch(() => {
    unlocked = false;
  });
}

export function playCarStart() {
  unlockAudio();
  play("/audio/car-start.mp3", 0.52);
}

export function playShopBell(panel: string | null) {
  if (!panel || !SHOP_PANELS.has(panel)) return;
  play("/audio/doorbell.mp3", 0.42);
}
