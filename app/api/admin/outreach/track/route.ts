import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// 1x1 transparent GIF
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const url = searchParams.get("url");

  if (!id || !type) {
    return new NextResponse("missing params", { status: 400 });
  }

  const sql = getDb();

  try {
    if (type === "open") {
      await sql`
        UPDATE outreach_sends SET opened_at = COALESCE(opened_at, NOW()) WHERE id = ${id}
      `;
      return new NextResponse(PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (type === "click") {
      await sql`
        UPDATE outreach_sends SET clicked_at = COALESCE(clicked_at, NOW()), opened_at = COALESCE(opened_at, NOW()) WHERE id = ${id}
      `;
      const redirectUrl = url || "https://hireacreator.ai/for-brands?ref=outreach";
      return NextResponse.redirect(redirectUrl, 302);
    }
  } catch {
    // Silently fail tracking — don't break user experience
  }

  return new NextResponse("ok", { status: 200 });
}
