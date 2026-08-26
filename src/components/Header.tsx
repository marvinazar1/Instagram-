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
              color: "white",
              fontSize: 26,
              fontWeight: 700,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {agentName}
          </div>
          <div
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            {pillarLabel}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
