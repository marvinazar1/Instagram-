import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export type TransitionFlashProps = {
  /** Absolute frame numbers where a new segment begins (excludes frame 0). */
  readonly boundaries: number[];
};

/**
 * A quick light-flash across every scene cut — the "hit" that makes a cut
 * feel intentional rather than an abrupt jump. Rendered once at the top of
 * VideoTemplate (outside the per-segment <Sequence> tree) so it can react to
 * the absolute frame at each boundary rather than resetting per-scene.
 */
export const TransitionFlash: React.FC<TransitionFlashProps> = ({
  boundaries,
}) => {
  const frame = useCurrentFrame();

  let opacity = 0;
  for (const boundary of boundaries) {
    const delta = frame - boundary;
    if (delta >= -2 && delta <= 8) {
      const local = interpolate(delta, [-2, 0, 8], [0, 0.9, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      opacity = Math.max(opacity, local);
    }
  }

  if (opacity <= 0) return null;

  return (
    <AbsoluteFill
      style={{ backgroundColor: "white", opacity, mixBlendMode: "overlay" }}
    />
  );
};
