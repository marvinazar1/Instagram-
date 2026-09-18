import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE_MARGIN } from "./constants";
import { Watermark } from "../../brand/Watermark";

// Common full-bleed scene shell: background color, safe-margin padding,
// a soft fade-in, and the fixed watermark that appears on every asset.
export const Scene: React.FC<{
  background: string;
  children: React.ReactNode;
  showWatermark?: boolean;
}> = ({ background, children, showWatermark = true }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: background }}>
      <AbsoluteFill
        style={{
          opacity,
          padding: SAFE_MARGIN,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </AbsoluteFill>
      {showWatermark && <Watermark />}
    </AbsoluteFill>
  );
};
