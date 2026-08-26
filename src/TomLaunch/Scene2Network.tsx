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

const QUERY = "What shifted in our Q3 research findings?";

type Node = {
  angle: number;
  radius: number;
  delay: number;
  hue: "cyan" | "violet";
  label: string;
};

const LABELS = [
  "arxiv.org",
  "internal-docs",
  "Q3-report.pdf",
  "notion.so",
  "slack-thread",
  "market-data",
  "prior-study",
  "github.com",
  "survey.csv",
  "email-thread",
];

export const Scene2Network: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2 + 70;

  const nodes: Node[] = useMemo(() => {
    return LABELS.map((label, i) => ({
      angle: (i / LABELS.length) * Math.PI * 2 + random(`s2-a-${i}`) * 0.4,
      radius: 300 + random(`s2-r-${i}`) * 210,
      delay: 55 + i * 7 + random(`s2-d-${i}`) * 8,
      hue: i % 2 === 0 ? "cyan" : "violet",
      label,
    }));
  }, []);

  const barProgress = spring({ frame, fps, config: { damping: 18 } });
  const typedChars = Math.floor(
    interpolate(frame, [12, 60], [0, QUERY.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const cursorOn = Math.floor(frame / 8) % 2 === 0;

  const barY = interpolate(frame, [0, 195], [-40, -170], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="s2line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.violet} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        {nodes.map((n, i) => {
          const p = spring({
            frame: frame - n.delay,
            fps,
            config: { damping: 22, mass: 0.6 },
          });
          const nx = cx + Math.cos(n.angle) * n.radius;
          const ny = cy + Math.sin(n.angle) * n.radius * 0.62;
          const lx = cx + (nx - cx) * p;
          const ly = cy + barY + (ny - (cy + barY)) * p;
          const color = n.hue === "cyan" ? COLORS.cyan : COLORS.violet;
          const pulse = 0.6 + 0.4 * Math.sin(frame / 10 + i);
          return (
            <g key={i} opacity={p}>
              <line
                x1={cx}
                y1={cy + barY}
                x2={lx}
                y2={ly}
                stroke="url(#s2line)"
                strokeWidth={1.4}
              />
              <circle
                cx={lx}
                cy={ly}
                r={5 + pulse * 1.6}
                fill={color}
                opacity={0.9}
                style={{ filter: `drop-shadow(0 0 10px ${color})` }}
              />
              <text
                x={lx}
                y={ly - 14}
                textAnchor="middle"
                fill={COLORS.inkDim}
                fontFamily={FONT_MONO}
                fontSize={16}
                opacity={p}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: cy,
          transform: `translateY(${barY}px) scale(${interpolate(barProgress, [0, 1], [0.85, 1])})`,
          opacity: barProgress,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(13,20,40,0.9)",
          border: `1px solid rgba(124,190,255,0.35)`,
          borderRadius: 999,
          padding: "22px 34px",
          minWidth: 620,
          boxShadow: `0 0 50px -12px ${COLORS.cyan}`,
        }}
      >
        <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={COLORS.cyan} strokeWidth="2" />
          <line x1="16.2" y1="16.2" x2="21" y2="21" stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 26,
            color: COLORS.ink,
            whiteSpace: "nowrap",
          }}
        >
          {QUERY.slice(0, typedChars)}
          <span style={{ opacity: cursorOn ? 1 : 0, color: COLORS.cyan }}>|</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
