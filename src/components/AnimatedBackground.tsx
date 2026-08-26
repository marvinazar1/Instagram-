import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, GLOW_COLORS, gradientAt, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";

type Orb = {
  readonly color: string;
  readonly size: number;
  readonly baseX: number;
  readonly baseY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly periodInSeconds: number;
  readonly phase: number;
  readonly opacity: number;
};

const ORBS: Orb[] = [
  {
    color: GLOW_COLORS[0],
    size: VIDEO_WIDTH * 1.1,
    baseX: VIDEO_WIDTH * 0.15,
    baseY: VIDEO_HEIGHT * 0.22,
    radiusX: 90,
    radiusY: 130,
    periodInSeconds: 14,
    phase: 0,
    opacity: 0.22,
  },
  {
    color: GLOW_COLORS[1],
    size: VIDEO_WIDTH * 1.3,
    baseX: VIDEO_WIDTH * 0.85,
    baseY: VIDEO_HEIGHT * 0.78,
    radiusX: 110,
    radiusY: 90,
    periodInSeconds: 18,
    phase: Math.PI,
    opacity: 0.18,
  },
  {
    color: GLOW_COLORS[2],
    size: VIDEO_WIDTH * 0.7,
    baseX: VIDEO_WIDTH * 0.8,
    baseY: VIDEO_HEIGHT * 0.15,
    radiusX: 70,
    radiusY: 100,
    periodInSeconds: 11,
    phase: Math.PI / 2,
    opacity: 0.14,
  },
];

/**
 * A single persistent background layer that drifts and breathes for the
 * entire video, instead of a flat frame re-painted per scene — constant
 * subtle motion is what holds attention during the "quiet" parts of a Reel.
 * Locked to the black/white/gold brand standard: a black-to-charcoal
 * gradient, gold-only glow orbs (never colored per pillar), and a dark
 * vignette for a cinematic, high-end feel rather than a flat slide.
 *
 * Rendered once at the top of VideoTemplate, outside the per-segment
 * <Sequence> tree, so the motion is continuous across cuts rather than
 * resetting every scene.
 */
export const AnimatedBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const angle = 145 + (frame / durationInFrames) * 70;
  const scale = 1.08 + 0.05 * Math.sin((frame / durationInFrames) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: BRAND.black }}>
      <AbsoluteFill
        style={{
          background: gradientAt(angle),
          transform: `scale(${scale})`,
        }}
      />
      {ORBS.map((orb, index) => {
        const t = (frame / fps / orb.periodInSeconds) * Math.PI * 2 + orb.phase;
        const x = orb.baseX + Math.cos(t) * orb.radiusX;
        const y = orb.baseY + Math.sin(t) * orb.radiusY;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x - orb.size / 2,
              top: y - orb.size / 2,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              opacity: orb.opacity,
              filter: "blur(90px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      {/* Fine grain so large dark gradient areas don't band on compression. */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />
      {/* Cinematic vignette — keeps the frame reading as premium/dark even
          where the gradient itself lightens. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
