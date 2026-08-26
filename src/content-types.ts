export type ReelScene = {
  readonly text: string;
  readonly durationInSeconds: number;
};

export type ReelContent = {
  readonly pillar: string;
  readonly pillarLabel: string;
  readonly agentName: string;
  readonly hook: string;
  readonly hookDurationInSeconds: number;
  readonly scenes: ReelScene[];
  readonly cta: string;
  readonly ctaDurationInSeconds: number;
  readonly caption: string;
  readonly hashtags: string[];
};

export type ReelSegment = {
  readonly kind: "hook" | "scene" | "cta";
  readonly text: string;
  readonly durationInSeconds: number;
};

export const getSegments = (content: ReelContent): ReelSegment[] => {
  return [
    {
      kind: "hook",
      text: content.hook,
      durationInSeconds: content.hookDurationInSeconds,
    },
    ...content.scenes.map(
      (scene): ReelSegment => ({
        kind: "scene",
        text: scene.text,
        durationInSeconds: scene.durationInSeconds,
      }),
    ),
    {
      kind: "cta",
      text: content.cta,
      durationInSeconds: content.ctaDurationInSeconds,
    },
  ];
};

export const getTotalDurationInSeconds = (content: ReelContent): number => {
  return getSegments(content).reduce(
    (sum, segment) => sum + segment.durationInSeconds,
    0,
  );
};
