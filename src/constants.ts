export const FONT_FAMILY = "SF Pro Text, Helvetica, Arial, sans-serif";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

// Brand standard: black / white / gold ONLY, background always predominantly
// black/dark, high-end cinematic feel. Every color used anywhere in the
// video must come from this palette — do not introduce other hues.
export const BRAND = {
  black: "#000000",
  nearBlack: "#0a0908",
  charcoal: "#161310",
  gold: "#d4af37",
  goldBright: "#f2d375",
  goldDeep: "#7a5f1f",
  white: "#ffffff",
} as const;

// Accent color used to highlight emphasized words/numbers in on-screen text —
// the "bold keyword" technique that draws the eye and boosts caption
// readability/retention.
export const EMPHASIS_COLOR = BRAND.goldBright;

// The video background is always this black-to-charcoal gradient with a
// slowly drifting angle (see AnimatedBackground) — never pillar- or
// content-dependent, per brand standard.
export const gradientAt = (angleDeg: number): string =>
  `linear-gradient(${angleDeg}deg, ${BRAND.black} 0%, ${BRAND.charcoal} 55%, ${BRAND.nearBlack} 100%)`;

// Gold-only tones for the floating glow orbs, cycled across orbs.
export const GLOW_COLORS: readonly string[] = [
  BRAND.gold,
  BRAND.goldDeep,
  BRAND.goldBright,
];
