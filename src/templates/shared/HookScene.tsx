import React from "react";
import { colors, familyBg, Family } from "../../brand/palette";
import { fonts } from "../../brand/fonts";
import { Scene } from "./Scene";

// Slide 1 — Hook. Black or Navy background per family, one bold headline,
// minimal supporting text, icon watermark only (no full lockup here).
export const HookScene: React.FC<{
  family: Family;
  eyebrow?: string;
  headline: string;
  highlightWord?: string;
}> = ({ family, eyebrow, headline, highlightWord }) => {
  const parts = highlightWord ? headline.split(highlightWord) : [headline];

  return (
    <Scene background={familyBg[family]}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {eyebrow && (
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colors.lightGold,
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </span>
        )}
        <h1
          style={{
            fontFamily: fonts.hook,
            fontWeight: 800,
            fontSize: 88,
            lineHeight: 1.05,
            color: colors.white,
            margin: 0,
          }}
        >
          {highlightWord
            ? parts.map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < parts.length - 1 && (
                    <span style={{ color: colors.amberGold }}>
                      {highlightWord}
                    </span>
                  )}
                </React.Fragment>
              ))
            : headline}
        </h1>
      </div>
    </Scene>
  );
};
