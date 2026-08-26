// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';
import fs from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// This sandbox has a pre-installed Chromium + ffmpeg (used by Playwright)
// rather than network access to download Remotion's own copies.
const PW_CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const PW_FFMPEG = "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux";
if (fs.existsSync(PW_CHROMIUM)) {
  Config.setBrowserExecutable(PW_CHROMIUM);
  Config.setChromeMode("chrome-for-testing");
}
