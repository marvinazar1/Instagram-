import type { ReelContent } from "./content-types";

// Used only as the default preview in Remotion Studio. Real renders pass
// generated content via `--props=pipeline/output/content.json`.
export const sampleContent: ReelContent = {
  pillar: "market_updates",
  pillarLabel: "Market Updates",
  agentName: "Jane Smith Realty",
  hook: "Rates just dropped **again** — here's what it means for you.",
  hookDurationInSeconds: 2.5,
  scenes: [
    {
      text: "A **1% rate drop** can save you hundreds per month.",
      durationInSeconds: 3.5,
    },
    {
      text: "Waiting for the 'perfect' rate can cost you in **rising home prices**.",
      durationInSeconds: 3.5,
    },
    {
      text: "Get **pre-approved now** so you can move fast when the right home hits.",
      durationInSeconds: 3.5,
    },
  ],
  cta: "DM me **'RATES'** for a free payment breakdown.",
  ctaDurationInSeconds: 3,
  caption:
    "Rates are moving — here's what it actually means for your monthly payment. 🏡\n\nDM me 'RATES' and I'll run the numbers for you, free.",
  hashtags: [
    "#realestate",
    "#homebuying",
    "#mortgagerates",
    "#firsttimehomebuyer",
    "#realtor",
  ],
};
