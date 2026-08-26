export const COLORS = {
  navyDeep: "#03050c",
  navy: "#070b18",
  navyLight: "#0d1428",
  navyCard: "#101a35",
  cyan: "#22e2f5",
  cyanSoft: "#7fe9f7",
  violet: "#9b6bff",
  violetSoft: "#c7a8ff",
  ink: "#e7ecff",
  inkDim: "#8b93b8",
  line: "rgba(148,163,220,0.18)",
} as const;

export const FONT_SANS = "Outfit, ui-sans-serif, system-ui, sans-serif";
export const FONT_MONO =
  "Geist Mono, ui-monospace, SFMono-Regular, monospace";

export const GLOW_CYAN = `0 0 40px rgba(34,226,245,0.55)`;
export const GLOW_VIOLET = `0 0 40px rgba(155,107,255,0.55)`;

// Absolute frame ranges (30fps, 900 frames total = 30s)
export const SCENES = {
  chaosConverge: { from: 0, dur: 195 }, // 0.0 - 6.5s
  network: { from: 165, dur: 195 }, // overlap crossfade, 5.5 - 12s
  summary: { from: 345, dur: 195 }, // 11.5 - 18s
  dataStream: { from: 525, dur: 210 }, // 17.5 - 24.5s
  finale: { from: 705, dur: 195 }, // 23.5 - 30s
};

export const TOTAL_DURATION = 900;
export const FPS = 30;
