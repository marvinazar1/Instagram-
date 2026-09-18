import React from "react";
import { Series } from "remotion";
import { z } from "zod";
import { Family } from "../../brand/palette";
import { HookScene } from "../shared/HookScene";
import { CTAScene } from "../shared/CTAScene";
import { PropertyScene } from "../ListingShowcase/PropertyScene";
import { MapFlightScene } from "./MapFlightScene";
import { DriveScene } from "./DriveScene";

const photoSchema = z.object({
  src: z.string().optional(),
  caption: z.string(),
  detail: z.string().optional(),
});

export const relocationShowcaseSchema = z.object({
  family: z.enum(["gold", "navy"]),
  originLabel: z.string(),
  destinationLabel: z.string(),
  mapEyebrow: z.string().optional(),
  driveEyebrow: z.string().optional(),
  driveHeadline: z.string(),
  hookHeadline: z.string(),
  hookHighlight: z.string().optional(),
  hookEyebrow: z.string().optional(),
  photos: z.array(photoSchema).min(1),
  ctaText: z.string(),
  ctaSupporting: z.string().optional(),
  handle: z.string().optional(),
});

type Props = z.infer<typeof relocationShowcaseSchema>;

const MAP_FRAMES = 90; // 3s @ 30fps
const DRIVE_FRAMES = 75; // 2.5s @ 30fps
const HOOK_FRAMES = 75; // 2.5s @ 30fps
const PROPERTY_FRAMES = 90; // 3s @ 30fps per photo
const CTA_FRAMES = 90; // 3s @ 30fps

export const RelocationShowcase: React.FC<Props> = ({
  family,
  originLabel,
  destinationLabel,
  mapEyebrow,
  driveEyebrow,
  driveHeadline,
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
      <Series.Sequence durationInFrames={MAP_FRAMES}>
        <MapFlightScene
          family={typedFamily}
          eyebrow={mapEyebrow}
          originLabel={originLabel}
          destinationLabel={destinationLabel}
        />
      </Series.Sequence>

      <Series.Sequence durationInFrames={DRIVE_FRAMES}>
        <DriveScene
          family={typedFamily}
          eyebrow={driveEyebrow}
          headline={driveHeadline}
        />
      </Series.Sequence>

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

export const relocationShowcaseDuration = (photoCount: number) =>
  MAP_FRAMES +
  DRIVE_FRAMES +
  HOOK_FRAMES +
  PROPERTY_FRAMES * photoCount +
  CTA_FRAMES;
