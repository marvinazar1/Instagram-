import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { gradientAt } from "../constants";

export type AnimatedBackgroundProps = {
  readonly pillar: string;
};

/**
 * A single persistent background layer that drifts and breathes for the
 * entire video, instead of a flat gradient re-painted per scene. There's no
 * real b-roll footage in this template, so this is what keeps the frame from
 * reading as a static slide — constant subtle motion is what holds attention
 * during the "boring" parts of a Reel.
 *
 * Rendered once at the top of VideoTemplate, outside the per-segment
 * <Sequence> tree, so the drift is continuous across cuts rather than
 * resetting every scene.
 */
export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  pillar,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const angle = interpolate(frame, [0, durationInFrames], [145, 215]);
  const scale = 1.08 + 0.05 * Math.sin((frame / durationInFrames) * Math.PI * 2);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: gradientAt(pillar, angle),
          transform: `scale(${scale})`,
        }}
      />
    </AbsoluteFill>
  );
};
