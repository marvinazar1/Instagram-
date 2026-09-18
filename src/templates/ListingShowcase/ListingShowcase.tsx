import React from "react";
import { Series } from "remotion";
import { z } from "zod";
import { Family } from "../../brand/palette";
import { HookScene } from "../shared/HookScene";
import { CTAScene } from "../shared/CTAScene";
import { PropertyScene } from "./PropertyScene";

const photoSchema = z.object({
  src: z.string().optional(),
  caption: z.string(),
  detail: z.string().optional(),
});

export const listingShowcaseSchema = z.object({
  family: z.enum(["gold", "navy"]),
  hookHeadline: z.string(),
  hookHighlight: z.string().optional(),
  hookEyebrow: z.string().optional(),
  photos: z.array(photoSchema).min(1),
  ctaText: z.string(),
  ctaSupporting: z.string().optional(),
  handle: z.string().optional(),
});

type Props = z.infer<typeof listingShowcaseSchema>;

const HOOK_FRAMES = 75; // 2.5s @ 30fps
const PROPERTY_FRAMES = 90; // 3s @ 30fps per photo
const CTA_FRAMES = 90; // 3s @ 30fps

export const ListingShowcase: React.FC<Props> = ({
  family,
  hookHeadline,
  hookHighlight,
  hookEyebrow,
  photos,
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

      {photos.map((photo, i) => (
        <Series.Sequence key={i} durationInFrames={PROPERTY_FRAMES}>
          <PropertyScene
            src={photo.src}
            caption={photo.caption}
            detail={photo.detail}
          />
        </Series.Sequence>
      ))}

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

export const listingShowcaseDuration = (photoCount: number) =>
  HOOK_FRAMES + PROPERTY_FRAMES * photoCount + CTA_FRAMES;
