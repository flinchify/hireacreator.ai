import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { creatorId: string } }
) {
  const sql = getDb();
  const { creatorId } = params;

  // Get star count
  const countRows = await sql`
    SELECT COUNT(*)::int as count FROM creator_stars
    WHERE creator_id = ${creatorId}
  `;

  // Check if current user has starred
  let starred = false;
  const token = cookies().get("session_token")?.value;
  if (token) {
    const userRows = await sql`
      SELECT u.id FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
    if (userRows.length > 0) {
      const starRows = await sql`
        SELECT id FROM creator_stars
        WHERE user_id = ${userRows[0].id} AND creator_id = ${creatorId}
      `;
      starred = starRows.length > 0;
    }
  }

  return NextResponse.json({
    starCount: countRows[0].count,
    starred,
  });
}
