import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ReelSegment } from "../content-types";
import { FONT_FAMILY } from "../constants";

export type CaptionOverlayProps = {
  readonly segment: ReelSegment;
};

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ segment }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 220,
          opacity,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 30,
            fontWeight: 600,
            color: "white",
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: "14px 26px",
            borderRadius: 18,
            maxWidth: "90%",
          }}
        >
          {segment.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
