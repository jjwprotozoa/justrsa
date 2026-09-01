// app/opengraph-image.tsx — social preview card, generated at build time.

import { ImageResponse } from "next/og";

export const alt = "JUST RSA — Drop 001. You couldn't make this stuff up.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0b0b0b",
        color: "#efeae1",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 6 }}
      >
        <span>JUST RSA</span>
        <span style={{ color: "#b07c2a" }}>DROP 001 · CAPE TOWN · 29.08.26</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 104,
          fontWeight: 700,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        <span>You couldn&rsquo;t</span>
        <span>make this</span>
        <span>stuff up.</span>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#b9b3a8" }}>
        Two jets. One stadium. Just another Saturday in South Africa.
      </div>
    </div>,
    size,
  );
}
