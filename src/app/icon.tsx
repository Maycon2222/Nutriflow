import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 25% 20%, #bbf7d0 0%, #86efac 25%, #34d399 60%, #0f766e 100%)",
          color: "#ffffff",
          fontSize: 210,
          fontWeight: 800,
          fontFamily: "Arial",
          letterSpacing: -8,
        }}
      >
        NA
      </div>
    ),
    {
      ...size,
    },
  );
}

