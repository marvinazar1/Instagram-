// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

// Note: When using the Node.JS APIs, the config file doesn't apply. Instead, pass options directly to the APIs

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// This sandbox blocks Remotion's own Chrome download host, but a
// pre-installed headless Chromium is available at this fixed path.
const sandboxHeadlessShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(sandboxHeadlessShell)) {
  Config.setBrowserExecutable(sandboxHeadlessShell);
  // The sandbox's egress proxy re-terminates TLS with its own CA, which this
  // browser copy doesn't trust — needed for Chromium to fetch webfonts (e.g.
  // Google Fonts) during rendering.
  Config.setChromiumIgnoreCertificateErrors(true);
}
