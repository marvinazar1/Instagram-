import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONT_MONO, FONT_SANS } from "./theme";
import { LogoMark, Wordmark } from "./Logo";

const CHIME_LOCAL_FRAME = 150;

const StatTile: React.FC<{ label: string; value: number; suffix?: string; delay: number }> = ({
  label,
  value,
  suffix = "",
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const n = Math.round(interpolate(p, [0, 1], [0, value]));
  return (
    <div
      style={{
        flex: 1,
        borderRadius: 14,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${COLORS.line}`,
        padding: 18,
        opacity: p,
      }}
    >
      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.inkDim, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 30, fontWeight: 700, color: COLORS.ink }}>
        {n}
        {suffix}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ frame: number }> = ({ frame }) => {
  const barP = interpolate(frame, [50, 90], [0.15, 0.86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        width: 980,
        borderRadius: 22,
        overflow: "hidden",
        background: "linear-gradient(165deg, rgba(18,27,54,0.96), rgba(8,12,26,0.97))",
        border: `1px solid rgba(124,190,255,0.22)`,
        boxShadow: `0 60px 140px -30px rgba(0,0,0,0.6), 0 0 90px -20px rgba(34,226,245,0.25)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 26px",
          borderBottom: `1px solid ${COLORS.line}`,
        }}
      >
        <LogoMark size={30} spin={false} />
        <div style={{ fontFamily: FONT_SANS, fontWeight: 700, fontSize: 18, color: COLORS.ink, letterSpacing: 2 }}>
          TOM
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[COLORS.cyan, COLORS.violet, "rgba(255,255,255,0.2)"].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: 999, background: c }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 22, padding: 26 }}>
        <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${COLORS.line}`,
              padding: 20,
            }}
          >
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.cyanSoft, marginBottom: 10 }}>
              RESEARCH SUMMARY
            </div>
            {[0.95, 0.8, 0.62].map((w, i) => (
              <div
                key={i}
                style={{
                  width: `${w * 100}%`,
                  height: 10,
                  borderRadius: 5,
                  marginBottom: 10,
                  background: "rgba(200,210,255,0.14)",
                }}
              />
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: 11,
                    color: COLORS.cyan,
                    background: "rgba(34,226,245,0.1)",
                    borderRadius: 999,
                    padding: "3px 9px",
                  }}
                >
                  [{n}]
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            <StatTile label="SOURCES SCANNED" value={128} delay={70} />
            <StatTile label="HOURS SAVED" value={4} suffix=".2h" delay={82} />
          </div>
        </div>
        <div
          style={{
            flex: 1,
            borderRadius: 16,
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${COLORS.line}`,
            padding: 20,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.violetSoft, marginBottom: 12 }}>
            CONFIDENCE
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                width: `${barP * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.violet})`,
              }}
            />
          </div>
          <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${COLORS.line}`,
              }}
            />
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.violet})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Scene5Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dashIn = spring({ frame, fps, config: { damping: 18, mass: 0.9 } });
  const rotY = interpolate(dashIn, [0, 1], [-40, -20]) + Math.sin(frame / 65) * 4;
  const rotX = interpolate(dashIn, [0, 1], [26, 15]) + Math.cos(frame / 80) * 2;

  const recede = interpolate(frame, [95, 128], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dashScale = interpolate(recede, [0, 1], [1, 0.72]) * interpolate(dashIn, [0, 1], [0.82, 1]);
  const dashOpacity = interpolate(dashIn, [0, 1], [0, 1]) * interpolate(recede, [0, 1], [1, 0.28]);
  const dashY = interpolate(recede, [0, 1], [0, -70]);

  const logoProgress = interpolate(frame, [98, 132], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineP = interpolate(frame, [128, CHIME_LOCAL_FRAME], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chimePulse = interpolate(
    frame,
    [CHIME_LOCAL_FRAME - 6, CHIME_LOCAL_FRAME, CHIME_LOCAL_FRAME + 30],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const chimeScale = interpolate(
    frame,
    [CHIME_LOCAL_FRAME - 4, CHIME_LOCAL_FRAME + 2, CHIME_LOCAL_FRAME + 20],
    [1, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const ctaP = interpolate(frame, [CHIME_LOCAL_FRAME + 4, CHIME_LOCAL_FRAME + 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaPulse = 0.6 + 0.4 * Math.sin(frame / 14);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          perspective: 1800,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, calc(-50% + ${dashY}px))`,
        }}
      >
        <div
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${dashScale})`,
            opacity: dashOpacity,
            filter: `blur(${recede * 2.4}px)`,
          }}
        >
          <Dashboard frame={frame} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,255,255,${chimePulse * 0.5}) 0%, rgba(120,200,255,${chimePulse * 0.35}) 25%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "56%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 30,
          transform: `translateY(-50%) scale(${chimeScale})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: logoProgress }}>
          <LogoMark size={104} progress={logoProgress} />
          <Wordmark progress={logoProgress} fontSize={70} letterSpacing={14} />
        </div>

        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 30,
            color: COLORS.inkDim,
            letterSpacing: 2,
            opacity: taglineP,
            transform: `translateY(${(1 - taglineP) * 14}px)`,
          }}
        >
          Research, Reimagined.
        </div>

        <div
          style={{
            opacity: ctaP,
            transform: `translateY(${(1 - ctaP) * 14}px)`,
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 34px",
            borderRadius: 999,
            border: `1px solid rgba(124,190,255,0.4)`,
            background: "rgba(13,20,40,0.85)",
            boxShadow: `0 0 ${20 + ctaPulse * 22}px rgba(34,226,245,${0.35 + ctaPulse * 0.15})`,
            fontFamily: FONT_MONO,
            fontSize: 16,
            color: COLORS.ink,
            letterSpacing: 1,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: COLORS.cyan,
              boxShadow: `0 0 ${8 + ctaPulse * 10}px ${COLORS.cyan}`,
            }}
          />
          Coming soon
        </div>
      </div>
    </AbsoluteFill>
  );
};
