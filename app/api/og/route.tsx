import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          gap: "20px",
        }}
      >
        <img
          src="https://hireacreator.ai/logo-512.png"
          alt=""
          width={120}
          height={120}
        />
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#171717",
            letterSpacing: "-0.02em",
          }}
        >
          HireACreator.ai
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
