import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BRAND } from "../constants";

export type PillarGraphicProps = {
  readonly pillar: string;
};

// Simple line-art icons on a 0-200 viewBox, one per content pillar. Every
// <path>/<circle> sets pathLength={1} so a single shared stroke-dashoffset
// (set on the parent <g> below, which inherits to children) draws all of
// them on at a uniform rate regardless of each shape's actual geometry
// length — pathLength itself does NOT inherit from a group, so it has to be
// repeated on every element here.
const ICONS: Record<string, React.ReactNode> = {
  market_updates: (
    <>
      <path pathLength={1} d="M20 170 L20 20" />
      <path pathLength={1} d="M20 170 L180 170" />
      <path pathLength={1} d="M45 170 L45 120" strokeWidth={14} />
      <path pathLength={1} d="M85 170 L85 90" strokeWidth={14} />
      <path pathLength={1} d="M125 170 L125 60" strokeWidth={14} />
      <path pathLength={1} d="M40 100 L80 70 L120 50 L160 28" />
      <path pathLength={1} d="M138 26 L162 27 L163 50" />
    </>
  ),
  buyer_tips: (
    <>
      <path pathLength={1} d="M25 95 L90 45 L155 95" />
      <path pathLength={1} d="M42 88 V155 H138 V88" />
      <path pathLength={1} d="M75 155 V115 H105 V155" />
      <circle pathLength={1} cx="145" cy="130" r="26" />
      <path pathLength={1} d="M164 149 L184 169" />
    </>
  ),
  seller_tips: (
    <>
      {/* price tag, pointed end right */}
      <path pathLength={1} d="M35 45 H128 L168 78 L128 111 H35 Z" />
      <circle pathLength={1} cx="60" cy="78" r="9" />
      {/* separate rising trend line below, so it doesn't collide with the tag */}
      <path pathLength={1} d="M35 168 L75 133 L100 155 L155 103" />
      <path pathLength={1} d="M133 103 L155 103 L155 125" />
    </>
  ),
  homeowner_advice: (
    <>
      <path pathLength={1} d="M100 18 L172 44 V98 C172 140 140 166 100 182 C60 166 28 140 28 98 V44 Z" />
      <path pathLength={1} d="M68 100 L92 126 L136 74" />
    </>
  ),
};

/**
 * The native, zero-network alternative/complement to real stock B-roll: a
 * large soft line-art icon for the segment's content pillar, drawn on with
 * an animated stroke reveal, then gently breathing for the rest of the
 * segment. Rendered whenever a segment has no brollSrc from
 * pipeline/fetch_broll.py, so the frame still has a contextual visual
 * anchor instead of just the ambient gradient.
 */
export const PillarGraphic: React.FC<PillarGraphicProps> = ({ pillar }) => {
  const frame = useCurrentFrame();
  const icon = ICONS[pillar] ?? ICONS.market_updates;

  const drawProgress = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = 1 + 0.03 * Math.sin(frame / 40);
  const opacity = interpolate(frame, [0, 12], [0, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", opacity }}
    >
      <svg
        width={760}
        height={760}
        viewBox="0 0 200 200"
        style={{
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 0 40px ${BRAND.gold}66)`,
        }}
      >
        <g
          fill="none"
          stroke={BRAND.gold}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1}
          strokeDashoffset={1 - drawProgress}
        >
          {icon}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
