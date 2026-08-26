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

const TOKENS = ["0x4F2A", "vec[912]", "rank++", "chunk", "embed", "match", "score:0.9", "join", "ctx", "parse"];

const ROWS = [
  "Query embedded",
  "12 sources ranked",
  "Conflicts resolved",
  "Citations linked",
  "Confidence 96%",
  "Answer composed",
];

const KICK_FRAMES = [15, 45, 75, 105, 135, 165];

export const Scene4DataStream: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bubbleP = spring({ frame, fps, config: { damping: 18 } });

  const lanes = useMemo(
    () =>
      new Array(6).fill(0).map((_, i) => ({
        y: 220 + i * 118 + (random(`s4-y-${i}`) - 0.5) * 20,
        speed: 9 + random(`s4-sp-${i}`) * 6,
        hue: i % 2 === 0 ? "cyan" : "violet",
        tokenSet: new Array(6).fill(0).map((_, j) => TOKENS[(i * 3 + j) % TOKENS.length]),
      })),
    [],
  );

  const speedMul = interpolate(frame, [0, 100, 190], [0.4, 1, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const streamOpacity = interpolate(frame, [0, 20, 185, 210], [0, 1, 1, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nearestKickPulse = useMemo(() => {
    let best = 999;
    for (const k of KICK_FRAMES) best = Math.min(best, Math.abs(frame - k));
    return interpolate(best, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  }, [frame]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          opacity: streamOpacity * (0.5 + 0.5 * nearestKickPulse * 0.4 + 0.3),
        }}
      >
        <svg width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
          {lanes.map((lane, li) => (
            <g key={li}>
              {lane.tokenSet.map((tok, ti) => {
                const laneWidth = width + 400;
                const raw = (frame * lane.speed * speedMul + ti * 260) % laneWidth;
                const x = raw - 200;
                const color = lane.hue === "cyan" ? COLORS.cyan : COLORS.violet;
                const fade = interpolate(x, [0, 120, width - 200, width], [0, 1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <g key={ti} opacity={fade * 0.85}>
                    <rect
                      x={x}
                      y={lane.y - 14}
                      width={92}
                      height={28}
                      rx={8}
                      fill="rgba(13,20,42,0.85)"
                      stroke={color}
                      strokeOpacity={0.6}
                    />
                    <text
                      x={x + 46}
                      y={lane.y + 5}
                      textAnchor="middle"
                      fontFamily={FONT_MONO}
                      fontSize={13}
                      fill={color}
                    >
                      {tok}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 130,
          top: height / 2 - 240,
          opacity: bubbleP,
          transform: `translateX(${interpolate(bubbleP, [0, 1], [-60, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 14,
            color: COLORS.violetSoft,
            marginBottom: 10,
            letterSpacing: 1,
          }}
        >
          QUESTION
        </div>
        <div
          style={{
            width: 360,
            borderRadius: 18,
            padding: 22,
            background: "rgba(16,24,50,0.9)",
            border: `1px solid rgba(155,107,255,0.4)`,
            boxShadow: `0 0 40px -10px ${COLORS.violet}`,
            fontFamily: FONT_SANS,
            fontSize: 22,
            color: COLORS.ink,
          }}
        >
          "How did we outperform the roadmap?"
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 120,
          top: height / 2 - 260,
          width: 460,
          borderRadius: 20,
          padding: 30,
          background: "linear-gradient(160deg, rgba(20,30,58,0.95), rgba(11,16,34,0.95))",
          border: `1px solid rgba(34,226,245,0.3)`,
          boxShadow: `0 30px 80px -20px rgba(34,226,245,0.3)`,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 14,
            color: COLORS.cyanSoft,
            marginBottom: 18,
            letterSpacing: 1,
          }}
        >
          STRUCTURED ANSWER
        </div>
        {ROWS.map((row, i) => {
          const kickFrame = KICK_FRAMES[i];
          const p = interpolate(frame, [kickFrame, kickFrame + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const pop = interpolate(frame, [kickFrame, kickFrame + 4, kickFrame + 16], [1, 1.06, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={row}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                opacity: p,
                transform: `translateX(${(1 - p) * 24}px) scale(${pop})`,
                borderBottom: i < ROWS.length - 1 ? `1px solid ${COLORS.line}` : "none",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: COLORS.navyDeep,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 19, color: COLORS.ink }}>{row}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
