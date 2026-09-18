// Section 02 typography roles, mapped to Google Fonts stand-ins until
// The Azar Group's actual licensed font files are supplied.

import { loadFont as loadDisplaySerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadScript } from "@remotion/google-fonts/DancingScript";
import { loadFont as loadHook } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const displaySerif = loadDisplaySerif("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
const script = loadScript("normal", { weights: ["700"], subsets: ["latin"] });
const hook = loadHook("normal", { weights: ["700", "800"], subsets: ["latin"] });
const body = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] });

export const fonts = {
  displaySerif: displaySerif.fontFamily, // "THE AZAR" wordmark — titles/names only.
  script: script.fontFamily, // "Group" accent — one word/phrase max.
  hook: hook.fontFamily, // Hook text — every format.
  body: body.fontFamily, // Body copy.
} as const;
