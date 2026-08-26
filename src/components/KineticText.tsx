import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EMPHASIS_COLOR } from "../constants";
import type { WordTiming } from "../content-types";

export type KineticTextProps = {
  readonly text: string;
  readonly fontSize: number;
  /** Frames between each word's entrance start when `words` isn't provided. */
  readonly staggerFrames?: number;
  /** Real per-word timestamps from forced alignment (seconds, relative to
   * this segment's start). When present, words pop in exactly when spoken
   * instead of on a fixed simulated cascade. */
  readonly words?: WordTiming[];
};

type Token = {
  readonly text: string;
  readonly emphasized: boolean;
};

const tokenize = (raw: string): Token[] => {
  const tokens: Token[] = [];
  for (const part of raw.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const emphasized = part.startsWith("**") && part.endsWith("**");
    const clean = emphasized ? part.slice(2, -2) : part;
    for (const word of clean.split(" ")) {
      if (word) tokens.push({ text: word, emphasized });
    }
  }
  return tokens;
};

const isStat = (word: string): boolean => /[\d%$]/.test(word);

type WordSpanProps = {
  readonly text: string;
  readonly emphasized: boolean;
  readonly localFrame: number;
  readonly fps: number;
  readonly fontSize: number;
};

const WordSpan: React.FC<WordSpanProps> = ({
  text,
  emphasized,
  localFrame,
  fps,
  fontSize,
}) => {
  const progress = spring({
    frame: localFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.5 },
  });
  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [22, 0], {
    extrapolateLeft: "clamp",
  });
  const stat = emphasized && isStat(text);
  const scale = interpolate(progress, [0, 1], [stat ? 0.4 : 0.85, 1], {
    extrapolateLeft: "clamp",
  });

  return (
    <span
      style={{
        display: "inline-block",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        marginRight: "0.28em",
        color: emphasized ? EMPHASIS_COLOR : undefined,
        fontWeight: emphasized ? 900 : undefined,
        fontSize: stat ? fontSize * 1.1 : undefined,
        textShadow: stat ? `0 0 28px ${EMPHASIS_COLOR}aa` : undefined,
      }}
    >
      {text}
    </span>
  );
};

/**
 * Renders text as individually-animated words instead of one static block —
 * each word pops in on its own spring, with numbers/stats getting an extra
 * glow + oversized pop. This "kinetic typography" cascade is a big part of
 * what makes the template read as an edited short-form video rather than a
 * plain slideshow.
 *
 * With real per-word timestamps (`words`, from forced alignment), each word
 * pops in exactly when it's spoken — true karaoke-style sync. Without them
 * (e.g. the Remotion Studio preview using sample content with no audio), it
 * falls back to a fixed simulated cascade so there's still something to look
 * at.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize,
  staggerFrames = 2,
  words,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (words && words.length > 0) {
    return (
      <span>
        {words.map((word, index) => (
          <WordSpan
            key={index}
            text={word.word}
            emphasized={word.emphasized}
            localFrame={frame - Math.round(word.start * fps)}
            fps={fps}
            fontSize={fontSize}
          />
        ))}
      </span>
    );
  }

  const tokens = tokenize(text);
  return (
    <span>
      {tokens.map((token, index) => (
        <WordSpan
          key={index}
          text={token.text}
          emphasized={token.emphasized}
          localFrame={frame - index * staggerFrames}
          fps={fps}
          fontSize={fontSize}
        />
      ))}
    </span>
  );
};
