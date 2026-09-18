import React from "react";
import { Img, staticFile } from "remotion";
import { SAFE_MARGIN } from "../templates/shared/constants";

// Bottom-right icon watermark — same size and margin on every asset,
// every format, per Section 04.
export const Watermark: React.FC = () => {
  return (
    <Img
      src={staticFile("brand/watermark.png")}
      style={{
        position: "absolute",
        right: SAFE_MARGIN,
        bottom: SAFE_MARGIN,
        width: 110,
        height: 110,
        objectFit: "contain",
      }}
    />
  );
};
