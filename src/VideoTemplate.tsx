import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Header } from "./components/Header";
import { TextCard } from "./components/TextCard";
import { CaptionOverlay } from "./components/CaptionOverlay";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { TransitionFlash } from "./components/TransitionFlash";
import { getSegments, type ReelContent } from "./content-types";

export type VideoTemplateProps = {
  readonly content: ReelContent;
  /** Path relative to the `public/` directory, e.g. "audio/voiceover.mp3". */
  readonly audioSrc?: string;
};

export const VideoTemplate: React.FC<VideoTemplateProps> = ({
  content,
  audioSrc,
}) => {
  const { fps } = useVideoConfig();
  const segments = getSegments(content);

  let startFrame = 0;
  const boundaries: number[] = [];
  const sequences = segments.map((segment, index) => {
    const durationInFrames = Math.round(segment.durationInSeconds * fps);
    const from = startFrame;
    startFrame += durationInFrames;
    if (index > 0) boundaries.push(from);

    return (
      <Sequence key={index} from={from} durationInFrames={durationInFrames}>
        {segment.kind === "scene" ? (
          <CaptionOverlay segment={segment} />
        ) : (
          <TextCard segment={segment} />
        )}
        <Header
          pillarLabel={content.pillarLabel}
          agentName={content.agentName}
          segmentCount={segments.length}
          activeSegmentIndex={index}
        />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill>
      <AnimatedBackground pillar={content.pillar} />
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      {sequences}
      <TransitionFlash boundaries={boundaries} />
    </AbsoluteFill>
  );
};
