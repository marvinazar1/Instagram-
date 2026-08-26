import "./index.css";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { VideoTemplate } from "./VideoTemplate";
import { sampleContent } from "./sample-content";
import { getTotalDurationInSeconds } from "./content-types";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "./constants";
import type { ReelContent } from "./content-types";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // Vertical 9:16 Reel/Story template driven by generated content.
        // Render with: npx remotion render src/index.ts RealEstateReel out/reel.mp4 --props=pipeline/output/content.json
        id="RealEstateReel"
        component={VideoTemplate}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        durationInFrames={Math.round(
          getTotalDurationInSeconds(sampleContent) * VIDEO_FPS,
        )}
        defaultProps={{
          content: sampleContent,
          audioSrc: undefined,
        }}
        calculateMetadata={async ({ props }) => {
          const content = props.content as ReelContent;
          return {
            durationInFrames: Math.round(
              getTotalDurationInSeconds(content) * VIDEO_FPS,
            ),
          };
        }}
      />

      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2",
          logoColor2: "#86A8E7",
        }}
      />
    </>
  );
};
