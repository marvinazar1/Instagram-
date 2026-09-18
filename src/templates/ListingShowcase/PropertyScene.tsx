import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { colors, scrimOverlay } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { SAFE_MARGIN } from "../shared/constants";
import { Watermark } from "../../brand/Watermark";

// A body slide — one idea per slide, white background, Charcoal text,
// single Gold accent element. Here: one property photo per slide with a
// caption bar.
export const PropertyScene: React.FC<{
  src?: string;
  caption: string;
  detail?: string;
}> = ({ src, caption, detail }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.white, opacity }}>
      <AbsoluteFill style={{ height: "72%" }}>
        {src ? (
          <Img
            src={src}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <AbsoluteFill
            style={{
              backgroundColor: colors.charcoal,
              border: `3px dashed ${colors.bronzeGold}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 28,
                letterSpacing: 2,
                color: colors.lightGold,
                textTransform: "uppercase",
              }}
            >
              Add property photo
            </span>
          </AbsoluteFill>
        )}
        <AbsoluteFill
          style={{
            background: `linear-gradient(to bottom, transparent 60%, ${scrimOverlay} 100%)`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: "72%",
          left: 0,
          right: 0,
          bottom: 0,
          padding: SAFE_MARGIN,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 6,
            backgroundColor: colors.amberGold,
            marginBottom: 20,
          }}
        />
        <span
          style={{
            fontFamily: fonts.hook,
            fontWeight: 700,
            fontSize: 42,
            color: colors.charcoal,
            lineHeight: 1.15,
          }}
        >
          {caption}
        </span>
        {detail && (
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 400,
              fontSize: 26,
              color: colors.charcoal,
              opacity: 0.75,
              marginTop: 10,
            }}
          >
            {detail}
          </span>
        )}
      </div>

      <Watermark />
    </AbsoluteFill>
  );
};
