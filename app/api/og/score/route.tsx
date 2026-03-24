import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") || "instagram";
  const handle = searchParams.get("handle") || "unknown";

  let score = 0;
  let niche = "lifestyle";
  let postValue = 0;
  let displayName = handle;

  try {
    const db = getDb();
    const rows = await db`
      SELECT creator_score, niche, estimated_post_value, display_name 
      FROM claimed_profiles 
      WHERE platform = ${platform} AND platform_handle = ${handle.toLowerCase()} 
      LIMIT 1
    `;
    if (rows[0]) {
      score = (rows[0].creator_score as number) || 0;
      niche = (rows[0].niche as string) || "lifestyle";
      postValue = (rows[0].estimated_post_value as number) || 0;
      displayName = (rows[0].display_name as string) || handle;
    }
  } catch {
    // fallback to defaults
  }

  const scoreColor = score >= 75 ? "#22c55e" : score >= 60 ? "#eab308" : score >= 30 ? "#f97316" : "#ef4444";
  const formattedValue = postValue >= 100 ? `$${Math.round(postValue / 100)}` : "$5";
  const platformLabel = platform === "x" ? "X" : platform.charAt(0).toUpperCase() + platform.slice(1);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 50%, #e5e5e5 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: 32,
            padding: "48px 64px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.08)",
            border: "1px solid #e5e5e5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: "#171717",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {platformLabel[0]}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#171717" }}>
              @{handle}
            </div>
          </div>

          <div style={{ fontSize: 120, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ fontSize: 24, color: "#737373", marginTop: 8 }}>
            Creator Rating
          </div>

          <div style={{ display: "flex", gap: 32, marginTop: 32, fontSize: 18, color: "#525252" }}>
            <span>Est. {formattedValue}/post</span>
            <span style={{ color: "#d4d4d4" }}>|</span>
            <span style={{ textTransform: "capitalize" }}>{niche}</span>
            <span style={{ color: "#d4d4d4" }}>|</span>
            <span>{platformLabel}</span>
          </div>
        </div>

        <div style={{ marginTop: 32, fontSize: 18, color: "#a3a3a3" }}>
          hireacreator.ai
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
