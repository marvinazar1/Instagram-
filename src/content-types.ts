export type WordTiming = {
  readonly word: string;
  /** Seconds relative to this word's own segment start. */
  readonly start: number;
  readonly end: number;
  readonly emphasized: boolean;
};

export type ReelScene = {
  readonly text: string;
  readonly durationInSeconds: number;
  /** Present only when pipeline/align_words.py successfully aligned this segment. */
  readonly words?: WordTiming[];
};

export type ReelContent = {
  readonly pillar: string;
  readonly pillarLabel: string;
  readonly agentName: string;
  /** Path relative to the `public/` directory, e.g. "logo.png". Optional — falls back to a text mark. */
  readonly logoSrc?: string;
  readonly hook: string;
  readonly hookDurationInSeconds: number;
  /** Present only when pipeline/align_words.py successfully aligned the hook. */
  readonly hookWords?: WordTiming[];
  readonly scenes: ReelScene[];
  readonly cta: string;
  readonly ctaDurationInSeconds: number;
  /** Present only when pipeline/align_words.py successfully aligned the CTA. */
  readonly ctaWords?: WordTiming[];
  readonly caption: string;
  readonly hashtags: string[];
};

export type ReelSegment = {
  readonly kind: "hook" | "scene" | "cta";
  readonly text: string;
  readonly durationInSeconds: number;
  /** Real per-word timestamps from forced alignment; absent falls back to a simulated cascade. */
  readonly words?: WordTiming[];
};

export const getSegments = (content: ReelContent): ReelSegment[] => {
  return [
    {
      kind: "hook",
      text: content.hook,
      durationInSeconds: content.hookDurationInSeconds,
      words: content.hookWords,
    },
    ...content.scenes.map(
      (scene): ReelSegment => ({
        kind: "scene",
        text: scene.text,
        durationInSeconds: scene.durationInSeconds,
        words: scene.words,
      }),
    ),
    {
      kind: "cta",
      text: content.cta,
      durationInSeconds: content.ctaDurationInSeconds,
      words: content.ctaWords,
    },
  ];
};

export const getTotalDurationInSeconds = (content: ReelContent): number => {
  return getSegments(content).reduce(
    (sum, segment) => sum + segment.durationInSeconds,
    0,
  );
};
