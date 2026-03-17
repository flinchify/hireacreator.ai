import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/links/click — increment click count (public, no auth)
export async function POST(request: Request) {
  try {
    const { linkId } = await request.json().catch(() => ({ linkId: null }));
    if (!linkId) return NextResponse.json({ error: "linkId required" }, { status: 400 });
    const sql = getDb();
    await sql`UPDATE bio_links SET click_count = click_count + 1 WHERE id = ${linkId}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
