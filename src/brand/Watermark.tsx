import React from "react";
import { colors } from "./palette";
import { fonts } from "./fonts";
import { SAFE_MARGIN } from "../templates/shared/constants";

// Bottom-right icon watermark — same size and margin on every asset,
// every format, per Section 04. Placeholder monogram until the real
// logo mark file is supplied.
export const Watermark: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        right: SAFE_MARGIN,
        bottom: SAFE_MARGIN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: `2px solid ${colors.amberGold}`,
        backgroundColor: "rgba(7, 7, 7, 0.35)",
      }}
    >
      <span
        style={{
          fontFamily: fonts.displaySerif,
          fontWeight: 700,
          fontSize: 22,
          color: colors.amberGold,
          letterSpacing: 1,
        }}
      >
        AG
      </span>
    </div>
  );
};
