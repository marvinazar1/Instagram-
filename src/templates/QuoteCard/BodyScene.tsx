import React from "react";
import { colors } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { Scene } from "../shared/Scene";

// Body slide for text-led content — white background, Charcoal text,
// single Gold accent element (here: a divider above the copy).
export const QuoteBodyScene: React.FC<{
  text: string;
  attribution?: string;
}> = ({ text, attribution }) => {
  return (
    <Scene background={colors.white}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 6,
            backgroundColor: colors.amberGold,
            marginBottom: 32,
          }}
        />
        <p
          style={{
            fontFamily: fonts.body,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.35,
            color: colors.charcoal,
            margin: 0,
          }}
        >
          {text}
        </p>
        {attribution && (
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 26,
              color: colors.bronzeGold,
              marginTop: 28,
            }}
          >
            {attribution}
          </span>
        )}
      </div>
    </Scene>
  );
};
