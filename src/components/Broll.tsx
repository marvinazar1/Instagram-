import { AbsoluteFill, Img, OffthreadVideo, staticFile } from "remotion";
import { BRAND } from "../constants";
import type { BrollType } from "../content-types";

export type BrollProps = {
  readonly src: string;
  readonly type: BrollType;
};

const DUOTONE_FILTER_ID = "broll-duotone";

const hexChannel = (hex: string, index: number): string =>
  (parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255).toFixed(3);

/**
 * Real stock footage/photo per segment, graded to fit the strict
 * black/white/gold brand standard with a TRUE duotone remap — every pixel's
 * luminance is mapped onto a black-to-gold gradient via an SVG
 * feComponentTransfer filter (the same technique behind the classic
 * CSS-Tricks duotone effect), not a CSS filter-chain approximation, which
 * reads as a muddy olive wash instead of a clean black/gold grade. Topped
 * with a heavy black scrim so text stays legible and the frame reads as
 * "predominantly black" even over busy/bright footage.
 */
export const Broll: React.FC<BrollProps> = ({ src, type }) => {
  const mediaStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: `url(#${DUOTONE_FILTER_ID}) brightness(0.85) contrast(1.1)`,
  };

  return (
    <AbsoluteFill>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id={DUOTONE_FILTER_ID}>
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0
                      0.2126 0.7152 0.0722 0 0
                      0.2126 0.7152 0.0722 0 0
                      0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={`0 ${hexChannel(BRAND.gold, 0)}`} />
              <feFuncG type="table" tableValues={`0 ${hexChannel(BRAND.gold, 1)}`} />
              <feFuncB type="table" tableValues={`0 ${hexChannel(BRAND.gold, 2)}`} />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      {type === "video" ? (
        // Pexels clips typically run 10-30s+, comfortably longer than our
        // ~3-5s segments, so no looping needed for the common case.
        <OffthreadVideo src={staticFile(src)} volume={0} style={mediaStyle} />
      ) : (
        <Img src={staticFile(src)} style={mediaStyle} />
      )}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
