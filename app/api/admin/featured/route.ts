import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

function getWeekBounds() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    wsStr: weekStart.toISOString().split("T")[0],
    weStr: weekEnd.toISOString().split("T")[0],
  };
}

// GET — current week's featured creators
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sql = getDb();
  const { wsStr } = getWeekBounds();

  const featured = await sql`
    SELECT fr.*, u.full_name, u.slug, u.avatar_url, u.category
    FROM featured_rotations fr
    JOIN users u ON u.id = fr.creator_id
    WHERE fr.week_start = ${wsStr}
    ORDER BY fr.position ASC
  `;

  return NextResponse.json({ weekStart: wsStr, featured });
}

// POST — manually set featured creators for this week
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { creatorIds } = body as { creatorIds?: string[] };

  if (!creatorIds || !Array.isArray(creatorIds) || creatorIds.length === 0) {
    return NextResponse.json({ error: "creatorIds required" }, { status: 400 });
  }

  const sql = getDb();
  const { wsStr, weStr } = getWeekBounds();

  // Clear existing for this week
  await sql`DELETE FROM featured_rotations WHERE week_start = ${wsStr}`;

  // Insert new selections
  for (let i = 0; i < creatorIds.length; i++) {
    await sql`
      INSERT INTO featured_rotations (creator_id, week_start, week_end, position, reason)
      VALUES (${creatorIds[i]}, ${wsStr}, ${weStr}, ${i}, 'admin-override')
      ON CONFLICT (creator_id, week_start) DO UPDATE SET position = ${i}, reason = 'admin-override'
    `;
  }

  return NextResponse.json({ success: true, count: creatorIds.length });
}
