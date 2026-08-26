import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  const cyanX = 22 + 10 * Math.sin(frame / 140);
  const cyanY = 20 + 8 * Math.cos(frame / 160);
  const violetX = 78 + 10 * Math.cos(frame / 130 + 1);
  const violetY = 82 + 8 * Math.sin(frame / 150 + 1);

  // A slow overall brightness breathing so the electronic climax (scene 4)
  // reads brighter than the calm opening, without ever hard-cutting.
  const climaxGlow = Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.55) / 0.35))));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cyanX}% ${cyanY}%, rgba(34,226,245,${0.16 + climaxGlow * 0.08}) 0%, transparent 45%),
            radial-gradient(circle at ${violetX}% ${violetY}%, rgba(155,107,255,${0.16 + climaxGlow * 0.08}) 0%, transparent 45%),
            linear-gradient(180deg, ${COLORS.navy} 0%, ${COLORS.navyDeep} 60%, #010208 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,220,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,220,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.5,
          maskImage:
            "radial-gradient(ellipse at 50% 45%, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 45%, black 0%, transparent 72%)",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 260px 90px rgba(1,2,8,0.85)",
        }}
      />
    </AbsoluteFill>
  );
};
