import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReelSegment } from "../content-types";
import { FONT_FAMILY, PILLAR_GRADIENTS } from "../constants";

export type TextCardProps = {
  readonly segment: ReelSegment;
  readonly pillar: string;
};

export const TextCard: React.FC<TextCardProps> = ({ segment, pillar }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 180 },
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

  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const opacity = Math.min(entrance, exitOpacity);

  const gradient = PILLAR_GRADIENTS[pillar] ?? PILLAR_GRADIENTS.default;

  return (
    <AbsoluteFill style={{ background: gradient }}>
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
                padding: "8px 22px",
                borderRadius: 999,
                backgroundColor: "white",
                color: "#111",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              DON'T SCROLL PAST THIS
            </div>
          ) : null}
          <div
            style={{
              color: "white",
              fontSize: isHook ? 76 : 58,
              fontWeight: 800,
              lineHeight: 1.15,
              textShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            {segment.text}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
