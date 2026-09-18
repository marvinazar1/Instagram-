import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, familyBg, Family } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { SAFE_MARGIN } from "../shared/constants";
import { Watermark } from "../../brand/Watermark";

// A stylized flight-path graphic — no real satellite footage, just an
// animated route line + zoom, in brand colors. Origin/destination sit
// inside a 920x640 local coordinate box.
const BOX_W = 920;
const BOX_H = 640;
const ORIGIN = { x: 120, y: 440 };
const DEST = { x: 780, y: 160 };
const CONTROL = { x: 440, y: 40 };

const bezierPoint = (t: number) => {
  const x =
    (1 - t) ** 2 * ORIGIN.x + 2 * (1 - t) * t * CONTROL.x + t ** 2 * DEST.x;
  const y =
    (1 - t) ** 2 * ORIGIN.y + 2 * (1 - t) * t * CONTROL.y + t ** 2 * DEST.y;
  return { x, y };
};

const bezierAngle = (t: number) => {
  const dx = 2 * (1 - t) * (CONTROL.x - ORIGIN.x) + 2 * t * (DEST.x - CONTROL.x);
  const dy = 2 * (1 - t) * (CONTROL.y - ORIGIN.y) + 2 * t * (DEST.y - CONTROL.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

const DRAW_START = 10;
const DRAW_END = 60;
const ZOOM_START = 62;

export const MapFlightScene: React.FC<{
  family: Family;
  eyebrow?: string;
  originLabel: string;
  destinationLabel: string;
}> = ({ family, eyebrow, originLabel, destinationLabel }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const t = interpolate(frame, [DRAW_START, DRAW_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const plane = bezierPoint(Math.max(t, 0.001));
  const angle = bezierAngle(Math.max(t, 0.001));

  const zoom = interpolate(frame, [ZOOM_START, ZOOM_START + 28], [1, 1.55], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const destXPct = (DEST.x / BOX_W) * 100;
  const destYPct = (DEST.y / BOX_H) * 100;

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
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              transform: `scale(${zoom})`,
              transformOrigin: `${destXPct}% ${destYPct}%`,
            }}
          >
            <svg
              viewBox={`0 0 ${BOX_W} ${BOX_H}`}
              width="100%"
              style={{ overflow: "visible" }}
            >
              {/* Dot-grid map texture */}
              {Array.from({ length: 12 }).map((_, row) =>
                Array.from({ length: 16 }).map((_, col) => (
                  <circle
                    key={`${row}-${col}`}
                    cx={(col + 0.5) * (BOX_W / 16)}
                    cy={(row + 0.5) * (BOX_H / 12)}
                    r={2}
                    fill={colors.white}
                    opacity={0.06}
                  />
                )),
              )}

              {/* Route path */}
              <path
                d={`M ${ORIGIN.x} ${ORIGIN.y} Q ${CONTROL.x} ${CONTROL.y} ${DEST.x} ${DEST.y}`}
                fill="none"
                stroke={colors.amberGold}
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={100}
                strokeDashoffset={interpolate(t, [0, 1], [100, 0])}
              />

              {/* Origin pin — fades out before the zoom carries it off-frame */}
              <circle
                cx={ORIGIN.x}
                cy={ORIGIN.y}
                r={10}
                fill={colors.white}
                opacity={interpolate(frame, [ZOOM_START, ZOOM_START + 15], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              />
              <text
                x={ORIGIN.x}
                y={ORIGIN.y + 40}
                opacity={interpolate(frame, [ZOOM_START, ZOOM_START + 15], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
                fill={colors.white}
                fontFamily={fonts.body}
                fontWeight={600}
                fontSize={26}
                textAnchor="middle"
              >
                {originLabel}
              </text>

              {/* Destination pin (appears once the route reaches it) */}
              <circle
                cx={DEST.x}
                cy={DEST.y}
                r={10}
                fill={colors.amberGold}
                opacity={t > 0.95 ? 1 : 0.25}
              />
              <text
                x={DEST.x}
                y={DEST.y - 26}
                fill={colors.amberGold}
                fontFamily={fonts.hook}
                fontWeight={700}
                fontSize={30}
                textAnchor="middle"
                opacity={t > 0.95 ? 1 : 0}
              >
                {destinationLabel}
              </text>

              {/* Plane marker */}
              <g
                transform={`translate(${plane.x}, ${plane.y}) rotate(${angle})`}
                opacity={t > 0 && t < 1 ? 1 : 0}
              >
                <polygon
                  points="-16,0 12,-9 12,9"
                  fill={colors.white}
                />
              </g>
            </svg>
          </div>
        </div>
      </AbsoluteFill>
      <Watermark />
    </AbsoluteFill>
  );
};
