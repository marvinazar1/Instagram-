import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, familyBg, Family } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { SAFE_MARGIN } from "../shared/constants";
import { Watermark } from "../../brand/Watermark";

// Stylized POV-drive graphic — a converging road + approaching house mark,
// standing in for real driving footage until a real clip is shot/generated.
const BOX_W = 1080;
const BOX_H = 760;
const VANISH = { x: 540, y: 230 };

export const DriveScene: React.FC<{
  family: Family;
  eyebrow?: string;
  headline: string;
}> = ({ family, eyebrow, headline }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const houseScale = interpolate(frame, [0, 75], [0.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashOffset = -((frame * 10) % 70);

  return (
    <AbsoluteFill style={{ backgroundColor: familyBg[family] }}>
      <AbsoluteFill
        style={{
          opacity: fadeIn,
          padding: SAFE_MARGIN,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {eyebrow && (
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colors.lightGold,
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </span>
        )}

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <svg viewBox={`0 0 ${BOX_W} ${BOX_H}`} width="100%">
            {/* Horizon line */}
            <line
              x1={0}
              y1={VANISH.y}
              x2={BOX_W}
              y2={VANISH.y}
              stroke={colors.bronzeGold}
              strokeWidth={2}
              opacity={0.5}
            />

            {/* Converging road edges */}
            <line
              x1={60}
              y1={BOX_H}
              x2={VANISH.x}
              y2={VANISH.y}
              stroke={colors.white}
              strokeWidth={3}
              opacity={0.6}
            />
            <line
              x1={BOX_W - 60}
              y1={BOX_H}
              x2={VANISH.x}
              y2={VANISH.y}
              stroke={colors.white}
              strokeWidth={3}
              opacity={0.6}
            />

            {/* Center dashes, animating toward the viewer */}
            <line
              x1={VANISH.x}
              y1={VANISH.y}
              x2={VANISH.x}
              y2={BOX_H}
              stroke={colors.amberGold}
              strokeWidth={4}
              strokeDasharray="40 30"
              strokeDashoffset={dashOffset}
              opacity={0.8}
            />

            {/* Approaching house mark */}
            <g
              transform={`translate(${VANISH.x}, ${VANISH.y - 10}) scale(${houseScale})`}
            >
              <polygon
                points="-40,0 0,-34 40,0"
                fill="none"
                stroke={colors.amberGold}
                strokeWidth={4}
                strokeLinejoin="round"
              />
              <rect
                x={-30}
                y={0}
                width={60}
                height={38}
                fill="none"
                stroke={colors.white}
                strokeWidth={4}
              />
            </g>
          </svg>
        </div>

        <h1
          style={{
            fontFamily: fonts.hook,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1.1,
            color: colors.white,
            margin: 0,
            textAlign: "center",
          }}
        >
          {headline}
        </h1>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};
