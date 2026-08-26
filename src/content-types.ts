export type WordTiming = {
  readonly word: string;
  /** Seconds relative to this word's own segment start. */
  readonly start: number;
  readonly end: number;
  readonly emphasized: boolean;
};

export type BrollType = "video" | "photo";

export type ReelScene = {
  readonly text: string;
  readonly durationInSeconds: number;
  /** Present only when pipeline/align_words.py successfully aligned this segment. */
  readonly words?: WordTiming[];
  /** Path relative to `public/`. Present only when pipeline/fetch_broll.py found a match. */
  readonly brollSrc?: string;
  readonly brollType?: BrollType;
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
  readonly hookBrollSrc?: string;
  readonly hookBrollType?: BrollType;
  readonly scenes: ReelScene[];
  readonly cta: string;
  readonly ctaDurationInSeconds: number;
  /** Present only when pipeline/align_words.py successfully aligned the CTA. */
  readonly ctaWords?: WordTiming[];
  readonly ctaBrollSrc?: string;
  readonly ctaBrollType?: BrollType;
  readonly caption: string;
  readonly hashtags: string[];
};

export type ReelSegment = {
  readonly kind: "hook" | "scene" | "cta";
  readonly text: string;
  readonly durationInSeconds: number;
  /** Real per-word timestamps from forced alignment; absent falls back to a simulated cascade. */
  readonly words?: WordTiming[];
  /** Stock footage from pipeline/fetch_broll.py; absent falls back to the animated background only. */
  readonly brollSrc?: string;
  readonly brollType?: BrollType;
};

export const getSegments = (content: ReelContent): ReelSegment[] => {
  return [
    {
      kind: "hook",
      text: content.hook,
      durationInSeconds: content.hookDurationInSeconds,
      words: content.hookWords,
      brollSrc: content.hookBrollSrc,
      brollType: content.hookBrollType,
    },
    ...content.scenes.map(
      (scene): ReelSegment => ({
        kind: "scene",
        text: scene.text,
        durationInSeconds: scene.durationInSeconds,
        words: scene.words,
        brollSrc: scene.brollSrc,
        brollType: scene.brollType,
      }),
    ),
    {
      kind: "cta",
      text: content.cta,
      durationInSeconds: content.ctaDurationInSeconds,
      words: content.ctaWords,
      brollSrc: content.ctaBrollSrc,
      brollType: content.ctaBrollType,
    },
  ];
};

export const getTotalDurationInSeconds = (content: ReelContent): number => {
  return getSegments(content).reduce(
    (sum, segment) => sum + segment.durationInSeconds,
    0,
  );
};
