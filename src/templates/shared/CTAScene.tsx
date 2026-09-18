import React from "react";
import { colors, familyBg, Family } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { Scene } from "./Scene";
import { Wordmark } from "../../brand/Wordmark";

// Final slide — CTA. Navy or Black background, Amber headline + one clear
// action, White supporting copy. Full logo lockup lives here, not slide 1.
export const CTAScene: React.FC<{
  family: Family;
  ctaText: string;
  supportingText?: string;
  handle?: string;
}> = ({ family, ctaText, supportingText, handle }) => {
  return (
    <Scene background={familyBg[family]}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div />
        <div>
          <h1
            style={{
              fontFamily: fonts.hook,
              fontWeight: 800,
              fontSize: 76,
              lineHeight: 1.1,
              color: colors.amberGold,
              margin: 0,
            }}
          >
            {ctaText}
          </h1>
          {supportingText && (
            <p
              style={{
                fontFamily: fonts.body,
                fontWeight: 400,
                fontSize: 32,
                color: colors.white,
                marginTop: 20,
              }}
            >
              {supportingText}
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Wordmark scale={1.1} />
          {handle && (
            <span
              style={{
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 26,
                color: colors.white,
                opacity: 0.85,
              }}
            >
              {handle}
            </span>
          )}
        </div>
      </div>
    </Scene>
  );
};
