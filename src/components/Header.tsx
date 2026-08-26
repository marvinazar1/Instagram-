import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT_FAMILY } from "../constants";

export type HeaderProps = {
  readonly pillarLabel: string;
  readonly agentName: string;
  readonly segmentCount: number;
  readonly activeSegmentIndex: number;
};

export const Header: React.FC<HeaderProps> = ({
  pillarLabel,
  agentName,
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
                  index <= activeSegmentIndex
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.3)",
                boxShadow:
                  index === activeSegmentIndex
                    ? "0 0 10px rgba(255,255,255,0.8)"
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
              gap: 8,
              color: "white",
              fontSize: 26,
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 11.5L12 4l9 7.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 20v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {agentName}
          </div>
          <div
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            {pillarLabel}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
