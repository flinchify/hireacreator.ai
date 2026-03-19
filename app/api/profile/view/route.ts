import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const sql = getDb();

  // Check if the viewer is the owner (don't count self-views)
  const token = cookies().get("session_token")?.value;
  if (token) {
    const sessions = await sql`
      SELECT u.slug FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
      LIMIT 1
    `;
    if (sessions.length > 0 && sessions[0].slug === slug) {
      return NextResponse.json({ ok: true, self: true });
    }
  }

  // Increment profile_views counter (keep existing behavior)
  await sql`UPDATE users SET profile_views = COALESCE(profile_views, 0) + 1 WHERE slug = ${slug}`;

  // Also log detailed view to profile_views table
  const referrer = req.headers.get("referer") || null;
  const userAgent = req.headers.get("user-agent") || null;
  const forwarded = req.headers.get("x-forwarded-for");
  const viewerIp = forwarded ? forwarded.split(",")[0].trim() : null;

  const creators = await sql`SELECT id FROM users WHERE slug = ${slug} LIMIT 1`;
  if (creators.length > 0) {
    sql`
      INSERT INTO profile_views (creator_id, viewer_ip, referrer, user_agent)
      VALUES (${creators[0].id}, ${viewerIp}, ${referrer}, ${userAgent})
    `.catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
