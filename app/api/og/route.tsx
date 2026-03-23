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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <img
          src="https://hireacreator.ai/logo-512.png"
          alt=""
          width={300}
          height={300}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
