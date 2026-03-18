import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  const sql = getDb();
  const user = await getUser();

  // Always return star counts (public data)
  const countRows = await sql`
    SELECT creator_id, COUNT(*)::int as count
    FROM creator_stars
    GROUP BY creator_id
  `;
  const counts: Record<string, number> = {};
  for (const r of countRows) {
    counts[r.creator_id as string] = r.count as number;
  }

  // Return starred IDs only if logged in
  let starredCreatorIds: string[] = [];
  if (user) {
    const rows = await sql`
      SELECT creator_id FROM creator_stars WHERE user_id = ${user.id}
    `;
    starredCreatorIds = rows.map((r: any) => r.creator_id);
  }

  return NextResponse.json({ starredCreatorIds, starCounts: counts });
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { creatorId } = body;

  if (!creatorId) {
    return NextResponse.json({ error: "creatorId required" }, { status: 400 });
  }

  const sql = getDb();

  // Check if already starred
  const existing = await sql`
    SELECT id FROM creator_stars
    WHERE user_id = ${user.id} AND creator_id = ${creatorId}
  `;

  let starred: boolean;

  if (existing.length > 0) {
    // Unstar
    await sql`
      DELETE FROM creator_stars
      WHERE user_id = ${user.id} AND creator_id = ${creatorId}
    `;
    starred = false;
  } else {
    // Star
    await sql`
      INSERT INTO creator_stars (user_id, creator_id)
      VALUES (${user.id}, ${creatorId})
    `;
    starred = true;
  }

  // Get updated count
  const countRows = await sql`
    SELECT COUNT(*)::int as count FROM creator_stars
    WHERE creator_id = ${creatorId}
  `;

  return NextResponse.json({
    starred,
    starCount: countRows[0].count,
  });
}
