import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { gradientAt, pillarColors, VIDEO_HEIGHT, VIDEO_WIDTH } from "../constants";

export type AnimatedBackgroundProps = {
  readonly pillar: string;
};

type Orb = {
  readonly color: string;
  readonly size: number;
  readonly baseX: number;
  readonly baseY: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly periodInSeconds: number;
  readonly phase: number;
};

/**
 * A single persistent background layer that drifts and breathes for the
 * entire video, instead of a flat gradient re-painted per scene. There's no
 * real b-roll footage in this template, so this is what keeps the frame from
 * reading as a static slide — constant subtle motion is what holds attention
 * during the "boring" parts of a Reel. Blurred, drifting "mesh gradient" glow
 * orbs sit on top for the soft, premium depth that flat gradients lack.
 *
 * Rendered once at the top of VideoTemplate, outside the per-segment
 * <Sequence> tree, so the motion is continuous across cuts rather than
 * resetting every scene.
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  pillar,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const angle = 145 + (frame / durationInFrames) * 70;
  const scale = 1.08 + 0.05 * Math.sin((frame / durationInFrames) * Math.PI * 2);

  const colors = pillarColors(pillar);
  const orbs: Orb[] = [
    {
      color: colors[0],
      size: VIDEO_WIDTH * 1.1,
      baseX: VIDEO_WIDTH * 0.15,
      baseY: VIDEO_HEIGHT * 0.22,
      radiusX: 90,
      radiusY: 130,
      periodInSeconds: 14,
      phase: 0,
    },
    {
      color: colors[colors.length - 1],
      size: VIDEO_WIDTH * 1.3,
      baseX: VIDEO_WIDTH * 0.85,
      baseY: VIDEO_HEIGHT * 0.78,
      radiusX: 110,
      radiusY: 90,
      periodInSeconds: 18,
      phase: Math.PI,
    },
    {
      color: colors[Math.min(1, colors.length - 1)],
      size: VIDEO_WIDTH * 0.9,
      baseX: VIDEO_WIDTH * 0.8,
      baseY: VIDEO_HEIGHT * 0.15,
      radiusX: 70,
      radiusY: 100,
      periodInSeconds: 11,
      phase: Math.PI / 2,
    },
  ];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: gradientAt(pillar, angle),
          transform: `scale(${scale})`,
        }}
      />
      {orbs.map((orb, index) => {
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
              opacity: 0.55,
              filter: "blur(90px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      {/* Fine grain so large gradient areas don't band on compression. */}
      <AbsoluteFill
        style={{
          opacity: 0.05,
          mixBlendMode: "overlay",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)",
          backgroundSize: "3px 3px",
        }}
      />
    </AbsoluteFill>
  );
};
