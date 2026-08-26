import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_MONO } from "./theme";
import { LogoMark, Wordmark } from "./Logo";

type Shard = {
  angle: number;
  radius: number;
  rotation: number;
  delay: number;
  kind: "doc" | "tab";
  scale: number;
  hue: "cyan" | "violet";
};

const DocCard: React.FC<{ hue: "cyan" | "violet" }> = ({ hue }) => {
  const c = hue === "cyan" ? COLORS.cyan : COLORS.violet;
  return (
    <div
      style={{
        width: 150,
        height: 190,
        borderRadius: 14,
        background: "rgba(16,24,50,0.85)",
        border: `1px solid ${COLORS.line}`,
        boxShadow: `0 0 24px -6px ${c}`,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ width: 34, height: 6, borderRadius: 3, background: c }} />
      {[0.9, 0.7, 0.8, 0.5].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w * 100}%`,
            height: 8,
            borderRadius: 4,
            background: "rgba(200,210,255,0.18)",
          }}
        />
      ))}
    </div>
  );
};

const TabCard: React.FC<{ hue: "cyan" | "violet" }> = ({ hue }) => {
  const c = hue === "cyan" ? COLORS.cyan : COLORS.violet;
  return (
    <div
      style={{
        width: 210,
        height: 130,
        borderRadius: 12,
        background: "rgba(16,24,50,0.85)",
        border: `1px solid ${COLORS.line}`,
        boxShadow: `0 0 24px -6px ${c}`,
        padding: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: c,
            boxShadow: `0 0 10px ${c}`,
          }}
        />
        <div style={{ width: 90, height: 7, borderRadius: 4, background: "rgba(200,210,255,0.22)" }} />
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "rgba(200,210,255,0.14)", marginBottom: 8 }} />
      <div style={{ width: "70%", height: 6, borderRadius: 3, background: "rgba(200,210,255,0.14)" }} />
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 10,
          color: "rgba(200,210,255,0.3)",
          marginTop: 10,
        }}
      >
        research://source
      </div>
    </div>
  );
};

export const Scene1Convergence: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const shards: Shard[] = useMemo(() => {
    const n = 14;
    return new Array(n).fill(0).map((_, i) => ({
      angle: random(`s1-a-${i}`) * Math.PI * 2,
      radius: 620 + random(`s1-r-${i}`) * 560,
      rotation: (random(`s1-rot-${i}`) - 0.5) * 70,
      delay: random(`s1-d-${i}`) * 20,
      kind: random(`s1-k-${i}`) > 0.5 ? "doc" : "tab",
      scale: 0.7 + random(`s1-sc-${i}`) * 0.5,
      hue: random(`s1-h-${i}`) > 0.5 ? "cyan" : "violet",
    }));
  }, []);

  const flashFrame = 118;
  const flash = interpolate(frame, [flashFrame - 4, flashFrame, flashFrame + 26], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const assembleProgress = spring({
    frame: frame - 96,
    fps,
    config: { damping: 16, mass: 0.7 },
  });

  const wordProgress = interpolate(frame, [140, 182], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sceneScale = interpolate(frame, [0, 195], [1, 1.06], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${sceneScale})`,
      }}
    >
      {shards.map((s, i) => {
        const p = spring({
          frame: frame - s.delay,
          fps,
          config: { damping: 20, mass: 0.55, stiffness: 90 },
        });
        const startX = Math.cos(s.angle) * s.radius;
        const startY = Math.sin(s.angle) * s.radius;
        const x = interpolate(p, [0, 1], [startX, 0]);
        const y = interpolate(p, [0, 1], [startY, 0]);
        const rot = interpolate(p, [0, 1], [s.rotation, 0]);
        const scale = interpolate(p, [0, 0.85, 1], [s.scale, s.scale * 0.9, 0.05]);
        const opacity = interpolate(p, [0, 0.15, 0.82, 1], [0, 1, 1, 0]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
              opacity,
            }}
          >
            {s.kind === "doc" ? <DocCard hue={s.hue} /> : <TabCard hue={s.hue} />}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          width: width * 1.2,
          height: width * 1.2,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,${flash}) 0%, rgba(120,200,255,${flash * 0.6}) 22%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <LogoMark size={220} progress={assembleProgress} />
        <div style={{ transform: `translateY(${(1 - wordProgress) * 10}px)` }}>
          <Wordmark progress={wordProgress} fontSize={104} letterSpacing={20} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
