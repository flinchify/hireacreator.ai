import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/offers/count - Public endpoint to count pending offers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const handle = searchParams.get("handle");

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle required" }, { status: 400 });
    }

    const validPlatforms = ["instagram", "tiktok", "youtube", "x"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    // Normalize handle
    const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");
    if (!normalizedHandle) {
      return NextResponse.json({ error: "Invalid handle" }, { status: 400 });
    }

    const sql = getDb();

    // Count pending offers for this creator
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM offers 
      WHERE creator_platform = ${platform}
      AND creator_handle = ${normalizedHandle}
      AND status = 'pending'
      AND expires_at > NOW()
    `;

    const count = Number(result[0].count);

    return NextResponse.json({ count });

  } catch (err) {
    console.error("Offers count error:", err);
    return NextResponse.json({ error: "Failed to get offer count" }, { status: 500 });
  }
}