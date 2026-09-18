// The Azar Group brand palette — Section 01 of the brand system.
// Every AI-generated asset pulls from this palette only.

export const colors = {
  trueBlack: "#070707",
  charcoal: "#231F20",
  deepNavy: "#2B3990",
  brightCyan: "#00AEEF",
  bronzeGold: "#AC7524",
  amberGold: "#E38700",
  lightGold: "#FFD34D",
  white: "#FFFFFF",
} as const;

// Every post is classified as Gold (warm/luxury-led) or Navy (cool/trust-led).
export type Family = "gold" | "navy";

// Hook & CTA slides: Black or Navy background depending on family.
// Body slides always stay on the light/white side regardless of family.
export const familyBg = {
  gold: colors.trueBlack,
  navy: colors.deepNavy,
} as const satisfies Record<Family, string>;

export const scrimOverlay = "rgba(35, 31, 32, 0.8)"; // Charcoal at 80% — never pure black.
