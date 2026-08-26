import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, FONT_SANS } from "./theme";

// The abstract "TOM" mark: two interlocking diamonds (cyan + violet) in
// screen blend, orbited by small network nodes — reads as both a neural
// node and an app-icon glyph.
export const LogoMark: React.FC<{
  size?: number;
  progress?: number; // 0..1 assembly progress
  spin?: boolean;
}> = ({ size = 220, progress = 1, spin = true }) => {
  const frame = useCurrentFrame();
  const rot = spin ? frame * 0.6 : 0;
  const gap = (1 - progress) * 46;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="tomGradCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.cyanSoft} />
          <stop offset="100%" stopColor={COLORS.cyan} />
        </linearGradient>
        <linearGradient id="tomGradViolet" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.violetSoft} />
          <stop offset="100%" stopColor={COLORS.violet} />
        </linearGradient>
        <filter id="tomGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g style={{ mixBlendMode: "screen" }} filter="url(#tomGlow)" opacity={progress}>
        <rect
          x={100 - 46}
          y={100 - 46 - gap}
          width={92}
          height={92}
          rx={22}
          transform={`rotate(45 100 ${100 - gap})`}
          fill="url(#tomGradCyan)"
          opacity={0.92}
        />
        <rect
          x={100 - 46}
          y={100 - 46 + gap}
          width={92}
          height={92}
          rx={22}
          transform={`rotate(45 100 ${100 + gap})`}
          fill="url(#tomGradViolet)"
          opacity={0.92}
        />
      </g>

      <circle cx={100} cy={100} r={10} fill={COLORS.ink} opacity={progress} />

      <g
        style={{ transformOrigin: "100px 100px", transform: `rotate(${rot}deg)` }}
        opacity={progress}
      >
        {[0, 120, 240].map((a) => {
          const rad = (a * Math.PI) / 180;
          const r = 92;
          const cx = 100 + Math.cos(rad) * r;
          const cy = 100 + Math.sin(rad) * r;
          return (
            <g key={a}>
              <line
                x1={100}
                y1={100}
                x2={cx}
                y2={cy}
                stroke={COLORS.line}
                strokeWidth={1.5}
              />
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={a === 0 ? COLORS.cyan : COLORS.violet}
                filter="url(#tomGlow)"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const Wordmark: React.FC<{
  progress?: number;
  fontSize?: number;
  letterSpacing?: number;
}> = ({ progress = 1, fontSize = 96, letterSpacing = 14 }) => {
  const letters = ["T", "O", "M"];
  return (
    <div style={{ display: "flex" }}>
      {letters.map((l, i) => {
        const p = Math.min(1, Math.max(0, progress * 3 - i));
        return (
          <span
            key={i}
            style={{
              fontFamily: FONT_SANS,
              fontWeight: 700,
              fontSize,
              color: COLORS.ink,
              letterSpacing,
              opacity: p,
              transform: `translateY(${(1 - p) * 28}px)`,
              textShadow: `0 0 ${30 * p}px rgba(124,190,255,0.45)`,
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

export const LogoLockup: React.FC<{
  progress?: number;
  markSize?: number;
  fontSize?: number;
  gap?: number;
}> = ({ progress = 1, markSize = 120, fontSize = 64, gap = 28 }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      <LogoMark size={markSize} progress={Math.min(1, progress * 1.4)} />
      <Wordmark progress={progress} fontSize={fontSize} letterSpacing={10} />
    </div>
  );
};
