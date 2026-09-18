import React from "react";
import { Series } from "remotion";
import { z } from "zod";
import { Family } from "../../brand/palette";
import { HookScene } from "../shared/HookScene";
import { CTAScene } from "../shared/CTAScene";
import { QuoteBodyScene } from "./BodyScene";

export const quoteCardSchema = z.object({
  family: z.enum(["gold", "navy"]),
  hookEyebrow: z.string().optional(),
  hookHeadline: z.string(),
  hookHighlight: z.string().optional(),
  bodyText: z.string(),
  attribution: z.string().optional(),
  ctaText: z.string(),
  ctaSupporting: z.string().optional(),
  handle: z.string().optional(),
});

type Props = z.infer<typeof quoteCardSchema>;

const HOOK_FRAMES = 75; // 2.5s @ 30fps
const BODY_FRAMES = 120; // 4s @ 30fps
const CTA_FRAMES = 90; // 3s @ 30fps

export const QuoteCard: React.FC<Props> = ({
  family,
  hookEyebrow,
  hookHeadline,
  hookHighlight,
  bodyText,
  attribution,
  ctaText,
  ctaSupporting,
  handle,
}) => {
  const typedFamily = family as Family;

  return (
    <Series>
      <Series.Sequence durationInFrames={HOOK_FRAMES}>
        <HookScene
          family={typedFamily}
          eyebrow={hookEyebrow}
          headline={hookHeadline}
          highlightWord={hookHighlight}
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={BODY_FRAMES}>
        <QuoteBodyScene text={bodyText} attribution={attribution} />
      </Series.Sequence>

      <Series.Sequence durationInFrames={CTA_FRAMES}>
        <CTAScene
          family={typedFamily}
          ctaText={ctaText}
          supportingText={ctaSupporting}
          handle={handle}
        />
      </Series.Sequence>
    </Series>
  );
};

export const QUOTE_CARD_DURATION = HOOK_FRAMES + BODY_FRAMES + CTA_FRAMES;
