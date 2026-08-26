import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReelSegment } from "../content-types";
import { BRAND, FONT_FAMILY } from "../constants";
import { KineticText } from "./KineticText";

export type TextCardProps = {
  readonly segment: ReelSegment;
};

export const TextCard: React.FC<TextCardProps> = ({ segment }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slight underdamped bounce (rather than a flat ease-in) reads as more
  // energetic and helps each new line register as a pattern interrupt. The
  // word-by-word cascade inside KineticText handles the text's own reveal,
  // so this only drives the container pop + the CTA badge.
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
  });
  const entranceOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isCta = segment.kind === "cta";
  const isHook = segment.kind === "hook";

  // The CTA is always the last segment in the video — it must stay fully
  // readable through the final frame instead of fading out like a mid-video
  // transition would.
  const exitStart = durationInFrames - 12;
  const exitOpacity = isCta
    ? 1
    : interpolate(frame, [exitStart, durationInFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const scale = interpolate(entrance, [0, 1], [0.8, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = Math.min(entranceOpacity, exitOpacity);

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: "0 90px",
        }}
      >
        <div
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            textAlign: "center",
            fontFamily: FONT_FAMILY,
          }}
        >
          {isCta ? (
            <div
              style={{
                display: "inline-block",
                marginBottom: 24,
                padding: "10px 24px",
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(18px)",
                border: `1px solid ${BRAND.gold}88`,
                boxShadow: `0 0 32px ${BRAND.gold}55`,
                color: BRAND.white,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              DON&apos;T SCROLL PAST THIS
            </div>
          ) : null}
          <div
            style={{
              color: BRAND.white,
              fontSize: isHook ? 76 : 58,
              fontWeight: 800,
              lineHeight: 1.15,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            <KineticText text={segment.text} fontSize={isHook ? 76 : 58} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
