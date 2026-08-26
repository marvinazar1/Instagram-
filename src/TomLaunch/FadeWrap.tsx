import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const FadeWrap: React.FC<{
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({ dur, fadeIn = 26, fadeOut = 26, children }) => {
  const frame = useCurrentFrame();
  const fadeInOpacity =
    fadeIn <= 0
      ? 1
      : interpolate(frame, [0, fadeIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOutOpacity =
    fadeOut <= 0
      ? 1
      : interpolate(frame, [dur - fadeOut, dur], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
