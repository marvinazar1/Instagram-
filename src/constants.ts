export const FONT_FAMILY = "SF Pro Text, Helvetica, Arial, sans-serif";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;

// Gradient color stops per content pillar, kept separate from the angle so
// AnimatedBackground can drift the angle continuously for constant on-screen
// motion (a static frame reads as "dead" and hurts watch-time on Reels).
export const PILLAR_GRADIENT_STOPS: Record<string, string> = {
  market_updates: "#0f2027 0%, #203a43 55%, #2c5364 100%",
  buyer_tips: "#1a2a6c 0%, #2b5876 55%, #4e4376 100%",
  seller_tips: "#134e5e 0%, #2f7d5e 55%, #71b280 100%",
  homeowner_advice: "#3a1c71 0%, #8a2387 55%, #d76d77 100%",
  default: "#232526 0%, #414345 100%",
};

export const gradientAt = (pillar: string, angleDeg: number): string => {
  const stops = PILLAR_GRADIENT_STOPS[pillar] ?? PILLAR_GRADIENT_STOPS.default;
  return `linear-gradient(${angleDeg}deg, ${stops})`;
};

// Accent color used to highlight emphasized words/numbers in on-screen text —
// the "bold keyword" technique that draws the eye and boosts caption
// readability/retention.
export const EMPHASIS_COLOR = "#ffd23f";
