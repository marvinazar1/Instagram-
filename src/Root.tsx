import "./index.css";
import { Composition } from "remotion";
import { VERTICAL_WIDTH, VERTICAL_HEIGHT, FPS } from "./templates/shared/constants";
import {
  ListingShowcase,
  listingShowcaseSchema,
  listingShowcaseDuration,
} from "./templates/ListingShowcase/ListingShowcase";
import {
  QuoteCard,
  quoteCardSchema,
  QUOTE_CARD_DURATION,
} from "./templates/QuoteCard/QuoteCard";
import {
  RelocationShowcase,
  relocationShowcaseSchema,
  relocationShowcaseDuration,
} from "./templates/RelocationShowcase/RelocationShowcase";

// Each <Composition> is an entry in the sidebar!
// Both templates are built for Instagram Reels/Stories (1080x1920, 9:16)
// per The Azar Group brand system.

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ListingShowcase"
        component={ListingShowcase}
        schema={listingShowcaseSchema}
        durationInFrames={listingShowcaseDuration(3)}
        fps={FPS}
        width={VERTICAL_WIDTH}
        height={VERTICAL_HEIGHT}
        defaultProps={{
          family: "navy",
          hookEyebrow: "Just Listed",
          hookHeadline: "Your Next Chapter Starts Here",
          hookHighlight: "Chapter",
          photos: [
            {
              caption: "4 Bed | 3 Bath | 2,850 sqft",
              detail: "123 Ocean View Drive",
            },
            {
              caption: "Chef's Kitchen, Waterfront Views",
              detail: "Fully renovated 2025",
            },
            {
              caption: "Private Pool & Outdoor Living",
              detail: "0.4 acre lot",
            },
          ],
          ctaText: "DM ME TO TOUR",
          ctaSupporting: "Offered at $2,450,000",
          handle: "@marvinazar | The Azar Group",
        }}
      />

      <Composition
        id="QuoteCard"
        component={QuoteCard}
        schema={quoteCardSchema}
        durationInFrames={QUOTE_CARD_DURATION}
        fps={FPS}
        width={VERTICAL_WIDTH}
        height={VERTICAL_HEIGHT}
        defaultProps={{
          family: "gold",
          hookEyebrow: "Buyer Tip",
          hookHeadline: "Stop Waiting For The Perfect Rate",
          hookHighlight: "Perfect",
          bodyText:
            "Timing the market perfectly is a myth. Buying when it fits your life — and refinancing later — beats sitting on the sidelines for a rate that may never come.",
          attribution: "— Marvin Azar, The Azar Group",
          ctaText: "SAVE THIS FOR LATER",
          ctaSupporting: "Follow for more real talk on real estate",
          handle: "@marvinazar | The Azar Group",
        }}
      />

      <Composition
        id="RelocationShowcase"
        component={RelocationShowcase}
        schema={relocationShowcaseSchema}
        durationInFrames={relocationShowcaseDuration(2)}
        fps={FPS}
        width={VERTICAL_WIDTH}
        height={VERTICAL_HEIGHT}
        defaultProps={{
          family: "navy",
          originLabel: "Los Angeles, CA",
          destinationLabel: "Boston, MA",
          mapEyebrow: "Now Relocating Clients",
          driveEyebrow: "12:00 PM",
          driveHeadline: "Arriving At The Listing",
          hookEyebrow: "Just Listed",
          hookHeadline: "Your Next Chapter Starts Here",
          hookHighlight: "Chapter",
          photos: [
            {
              caption: "4 Bed | 3 Bath | 2,850 sqft",
              detail: "123 Ocean View Drive",
            },
            {
              caption: "Chef's Kitchen, Waterfront Views",
              detail: "Fully renovated 2025",
            },
          ],
          ctaText: "DM ME TO TOUR",
          ctaSupporting: "Offered at $2,450,000",
          handle: "@marvinazar | The Azar Group",
        }}
      />
    </>
  );
};
