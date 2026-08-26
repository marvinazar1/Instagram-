import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { ReelSegment } from "../content-types";
import { BRAND, FONT_FAMILY } from "../constants";
import { KineticText } from "./KineticText";

export type CaptionOverlayProps = {
  readonly segment: ReelSegment;
};

const CAPTION_FONT_SIZE = 30;

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ segment }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], {
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
            fontSize: CAPTION_FONT_SIZE,
            fontWeight: 600,
            color: BRAND.white,
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(18px)",
            border: `1px solid ${BRAND.gold}44`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            padding: "14px 26px",
            borderRadius: 18,
            maxWidth: "90%",
          }}
        >
          <KineticText text={segment.text} fontSize={CAPTION_FONT_SIZE} staggerFrames={1} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
