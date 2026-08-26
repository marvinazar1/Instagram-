import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { EMPHASIS_COLOR } from "../constants";

export type KineticTextProps = {
  readonly text: string;
  readonly fontSize: number;
  /** Frames between each word's entrance start. Smaller = faster cascade. */
  readonly staggerFrames?: number;
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

/**
 * Renders text as individually-animated words instead of one static block —
 * each word pops in on its own staggered spring, with numbers/stats getting
 * an extra glow + oversized pop. This "kinetic typography" cascade is the
 * single biggest visual difference between a template that reads as a
 * plain slideshow and one that reads as an edited short-form video.
 */
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  fontSize,
  staggerFrames = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tokens = tokenize(text);

  return (
    <span>
      {tokens.map((token, index) => {
        const localFrame = frame - index * staggerFrames;
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
        const stat = token.emphasized && isStat(token.text);
        const scale = interpolate(progress, [0, 1], [stat ? 0.4 : 0.85, 1], {
          extrapolateLeft: "clamp",
        });

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              marginRight: "0.28em",
              color: token.emphasized ? EMPHASIS_COLOR : undefined,
              fontWeight: token.emphasized ? 900 : undefined,
              fontSize: stat ? fontSize * 1.1 : undefined,
              textShadow: stat ? `0 0 28px ${EMPHASIS_COLOR}aa` : undefined,
            }}
          >
            {token.text}
          </span>
        );
      })}
    </span>
  );
};
