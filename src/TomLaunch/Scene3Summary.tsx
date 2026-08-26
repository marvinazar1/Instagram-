import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_MONO, FONT_SANS } from "./theme";

const ANSWER_LINES = [
  "Revenue signals strengthened 18% quarter-over-quarter,",
  "driven by faster onboarding and renewed enterprise demand.",
];

const CITATIONS = ["Q3-report.pdf", "market-data", "prior-study"];

export const Scene3Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stack = useMemo(
    () =>
      new Array(7).fill(0).map((_, i) => ({
        fan: (i - 3) * 10 + (random(`s3-fan-${i}`) - 0.5) * 4,
        offset: (i - 3) * 26,
        hue: i % 2 === 0 ? "cyan" : "violet",
      })),
    [],
  );

  const compress = spring({
    frame: frame - 55,
    fps,
    config: { damping: 20, mass: 0.7 },
  });

  const cardProgress = interpolate(frame, [95, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const citeStagger = (i: number) =>
    interpolate(frame, [150 + i * 10, 172 + i * 10], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {stack.map((s, i) => {
        const fanAngle = interpolate(compress, [0, 1], [s.fan, 0]);
        const dist = interpolate(compress, [0, 1], [1, 0]);
        const x = Math.sin((s.fan * Math.PI) / 180) * 120 * dist;
        const y = s.offset * dist - 40 * dist;
        const scale = interpolate(compress, [0, 1], [1, 0.15]);
        const opacity = interpolate(compress, [0, 0.75, 1], [0.95, 0.9, 0]);
        const color = s.hue === "cyan" ? COLORS.cyan : COLORS.violet;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 300,
              height: 200,
              borderRadius: 16,
              background: "rgba(16,24,50,0.88)",
              border: `1px solid ${COLORS.line}`,
              boxShadow: `0 10px 40px -12px ${color}`,
              transform: `translate(${x}px, ${y}px) rotate(${fanAngle}deg) scale(${scale})`,
              opacity,
              padding: 20,
            }}
          >
            <div style={{ width: 46, height: 7, borderRadius: 4, background: color, marginBottom: 14 }} />
            {[0.9, 0.75, 0.6, 0.4].map((w, j) => (
              <div
                key={j}
                style={{
                  width: `${w * 100}%`,
                  height: 9,
                  borderRadius: 4,
                  marginBottom: 10,
                  background: "rgba(200,210,255,0.16)",
                }}
              />
            ))}
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          width: 760,
          borderRadius: 24,
          background: "linear-gradient(160deg, rgba(20,30,58,0.95), rgba(11,16,34,0.95))",
          border: `1px solid rgba(124,190,255,0.28)`,
          boxShadow: `0 30px 90px -20px rgba(34,226,245,0.25), 0 30px 90px -20px rgba(155,107,255,0.2)`,
          padding: 40,
          opacity: cardProgress,
          transform: `scale(${interpolate(cardProgress, [0, 1], [0.82, 1])}) translateY(${interpolate(cardProgress, [0, 1], [40, 0])}px)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})`,
            }}
          />
          <div style={{ fontFamily: FONT_SANS, fontSize: 22, color: COLORS.inkDim, letterSpacing: 1 }}>
            Cited Summary
          </div>
          <div style={{ marginLeft: "auto", fontFamily: FONT_MONO, fontSize: 14, color: COLORS.cyan }}>
            ✓ verified
          </div>
        </div>

        {ANSWER_LINES.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT_SANS,
              fontSize: 30,
              lineHeight: 1.5,
              color: COLORS.ink,
              opacity: interpolate(frame, [110 + i * 12, 130 + i * 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {line}
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
          {CITATIONS.map((c, i) => (
            <div
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(124,190,255,0.08)",
                border: `1px solid rgba(124,190,255,0.25)`,
                opacity: citeStagger(i),
                transform: `translateY(${(1 - citeStagger(i)) * 10}px)`,
                fontFamily: FONT_MONO,
                fontSize: 15,
                color: COLORS.cyanSoft,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "rgba(34,226,245,0.16)",
                  color: COLORS.cyan,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                {i + 1}
              </span>
              {c}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
