import React from "react";
import { Img, staticFile } from "remotion";

// Full lockup — cover/CTA slides only, per Section 03 ("no logo lockup with
// tagline on the hook slide; full lockup on the CTA slide instead").
export const Wordmark: React.FC<{
  scale?: number;
}> = ({ scale = 1 }) => {
  return (
    <Img
      src={staticFile("brand/logo-lockup.jpg")}
      style={{
        width: 340 * scale,
        height: 340 * scale,
        objectFit: "contain",
      }}
    />
  );
};
