import React from "react";
import { colors } from "./palette";
import { fonts } from "./fonts";

// Full lockup — cover/CTA slides only, per Section 03 ("no logo lockup with
// tagline on the hook slide; full lockup on the CTA slide instead").
// Placeholder wordmark until the real logo file is supplied.
export const Wordmark: React.FC<{
  color?: string;
  scale?: number;
}> = ({ color = colors.white, scale = 1 }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2 * scale,
      }}
    >
      <span
        style={{
          fontFamily: fonts.displaySerif,
          fontWeight: 700,
          fontSize: 44 * scale,
          letterSpacing: 6 * scale,
          color,
          lineHeight: 1,
        }}
      >
        THE AZAR
      </span>
      <span
        style={{
          fontFamily: fonts.script,
          fontWeight: 700,
          fontSize: 52 * scale,
          color: colors.amberGold,
          lineHeight: 1,
        }}
      >
        Group
      </span>
    </div>
  );
};
