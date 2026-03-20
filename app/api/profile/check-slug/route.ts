import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
  const token = cookies().get("session_token")?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const sessions = await sql`SELECT user_id FROM auth_sessions WHERE token = ${token} AND expires_at > NOW()`;
  if (sessions.length === 0) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = sessions[0].user_id;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ available: false, message: "Slug is required." });
  }

  // Format validation
  if (slug.length < 3 || slug.length > 30) {
    return NextResponse.json({ available: false, message: "Must be 3–30 characters." });
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) {
    return NextResponse.json({ available: false, message: "Only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen." });
  }

  // Check uniqueness (exclude current user)
  const existing = await sql`SELECT id FROM users WHERE slug = ${slug} AND id != ${userId}`;
  if (existing.length > 0) {
    // Suggest a variation
    let suggestion = "";
    for (let i = 1; i <= 9; i++) {
      const candidate = `${slug}${i}`;
      if (candidate.length <= 30) {
        const check = await sql`SELECT id FROM users WHERE slug = ${candidate}`;
        if (check.length === 0) { suggestion = candidate; break; }
      }
    }
    return NextResponse.json({ available: false, message: "That URL is already in use.", suggestion: suggestion || undefined });
  }

  return NextResponse.json({ available: true });
  } catch (e) {
    console.error('[CheckSlug]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
