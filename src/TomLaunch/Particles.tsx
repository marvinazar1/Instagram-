import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "./theme";

type Particle = {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  hue: "cyan" | "violet";
  phase: number;
};

export const Particles: React.FC<{
  seed?: string;
  count?: number;
  opacity?: number;
}> = ({ seed = "tom-particles", count = 70, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const particles: Particle[] = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => ({
      x: random(`${seed}-x-${i}`) * width,
      y: random(`${seed}-y-${i}`) * height,
      r: 1 + random(`${seed}-r-${i}`) * 2.4,
      speed: 0.15 + random(`${seed}-s-${i}`) * 0.5,
      drift: (random(`${seed}-d-${i}`) - 0.5) * 40,
      hue: random(`${seed}-h-${i}`) > 0.5 ? "cyan" : "violet",
      phase: random(`${seed}-p-${i}`) * Math.PI * 2,
    }));
  }, [count, seed, width, height]);

  const t = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {particles.map((p, i) => {
          const y = ((p.y - t * p.speed * height * 6) % (height + 100) + height + 100) % (height + 100) - 50;
          const x = p.x + Math.sin(frame / 60 + p.phase) * p.drift;
          const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(frame / 20 + p.phase * 3));
          const color = p.hue === "cyan" ? COLORS.cyan : COLORS.violet;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={p.r}
              fill={color}
              opacity={twinkle * 0.8}
              style={{ filter: `drop-shadow(0 0 ${p.r * 2.5}px ${color})` }}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
