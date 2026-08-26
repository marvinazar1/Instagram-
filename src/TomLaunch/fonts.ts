import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontsLoaded = Promise.all([
  loadFont({
    family: "Outfit",
    url: staticFile("fonts/Outfit-Regular.ttf"),
    weight: "400",
  }),
  loadFont({
    family: "Outfit",
    url: staticFile("fonts/Outfit-Bold.ttf"),
    weight: "700",
  }),
  loadFont({
    family: "Geist Mono",
    url: staticFile("fonts/GeistMono-Regular.ttf"),
    weight: "400",
  }),
  loadFont({
    family: "Geist Mono",
    url: staticFile("fonts/GeistMono-Bold.ttf"),
    weight: "700",
  }),
]);
