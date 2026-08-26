import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BRAND, FONT_FAMILY } from "../constants";

export type HeaderProps = {
  readonly pillarLabel: string;
  readonly agentName: string;
  /** Path relative to the `public/` directory, e.g. "logo.png". Optional — falls back to a gold house mark. */
  readonly logoSrc?: string;
  readonly segmentCount: number;
  readonly activeSegmentIndex: number;
};

export const Header: React.FC<HeaderProps> = ({
  pillarLabel,
  agentName,
  logoSrc,
  segmentCount,
  activeSegmentIndex,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          position: "absolute",
          top: 56,
          left: 32,
          right: 32,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: segmentCount }).map((_, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor:
                  index <= activeSegmentIndex ? BRAND.gold : "rgba(255,255,255,0.25)",
                boxShadow:
                  index === activeSegmentIndex
                    ? `0 0 10px ${BRAND.gold}cc`
                    : undefined,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: BRAND.white,
              fontSize: 26,
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            }}
          >
            {logoSrc ? (
              <Img src={staticFile(logoSrc)} style={{ height: 32, width: "auto" }} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 11.5L12 4l9 7.5"
                  stroke={BRAND.gold}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9"
                  stroke={BRAND.gold}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 20v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20"
                  stroke={BRAND.gold}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {agentName}
          </div>
          <div
            style={{
              color: BRAND.white,
              fontSize: 20,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(18px)",
              border: `1px solid ${BRAND.gold}55`,
            }}
          >
            {pillarLabel}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
