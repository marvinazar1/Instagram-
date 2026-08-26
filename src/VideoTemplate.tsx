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
import { getSegments, type ReelContent } from "./content-types";
import { PILLAR_GRADIENTS } from "./constants";

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
  const gradient = PILLAR_GRADIENTS[content.pillar] ?? PILLAR_GRADIENTS.default;

  let startFrame = 0;
  const sequences = segments.map((segment, index) => {
    const durationInFrames = Math.round(segment.durationInSeconds * fps);
    const from = startFrame;
    startFrame += durationInFrames;

    return (
      <Sequence key={index} from={from} durationInFrames={durationInFrames}>
        {segment.kind === "scene" ? (
          <AbsoluteFill style={{ background: gradient }}>
            <CaptionOverlay segment={segment} />
          </AbsoluteFill>
        ) : (
          <TextCard segment={segment} pillar={content.pillar} />
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
    <AbsoluteFill style={{ background: gradient }}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}
      {sequences}
    </AbsoluteFill>
  );
};
