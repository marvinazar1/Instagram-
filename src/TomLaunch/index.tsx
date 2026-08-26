import React from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Sequence,
  staticFile,
} from "remotion";
import { Backdrop } from "./Backdrop";
import { Particles } from "./Particles";
import { FadeWrap } from "./FadeWrap";
import { Scene1Convergence } from "./Scene1Convergence";
import { Scene2Network } from "./Scene2Network";
import { Scene3Summary } from "./Scene3Summary";
import { Scene4DataStream } from "./Scene4DataStream";
import { Scene5Finale } from "./Scene5Finale";
import { fontsLoaded } from "./fonts";
import { SCENES } from "./theme";

const fontHandle = delayRender("Loading Outfit + Geist Mono fonts");
fontsLoaded
  .then(() => continueRender(fontHandle))
  .catch((err) => {
    console.error(err);
    continueRender(fontHandle);
  });

export const TomLaunch: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#010208" }}>
      <Backdrop />
      <Particles seed="ambient" count={60} opacity={0.6} />

      <Sequence from={SCENES.chaosConverge.from} durationInFrames={SCENES.chaosConverge.dur}>
        <FadeWrap dur={SCENES.chaosConverge.dur} fadeIn={0}>
          <Scene1Convergence />
        </FadeWrap>
      </Sequence>

      <Sequence from={SCENES.network.from} durationInFrames={SCENES.network.dur}>
        <FadeWrap dur={SCENES.network.dur}>
          <Scene2Network />
        </FadeWrap>
      </Sequence>

      <Sequence from={SCENES.summary.from} durationInFrames={SCENES.summary.dur}>
        <FadeWrap dur={SCENES.summary.dur}>
          <Scene3Summary />
        </FadeWrap>
      </Sequence>

      <Sequence from={SCENES.dataStream.from} durationInFrames={SCENES.dataStream.dur}>
        <FadeWrap dur={SCENES.dataStream.dur}>
          <Scene4DataStream />
        </FadeWrap>
      </Sequence>

      <Sequence from={SCENES.finale.from} durationInFrames={SCENES.finale.dur}>
        <FadeWrap dur={SCENES.finale.dur} fadeOut={0}>
          <Scene5Finale />
        </FadeWrap>
      </Sequence>

      <Audio src={staticFile("audio/tom-theme.wav")} />
    </AbsoluteFill>
  );
};
