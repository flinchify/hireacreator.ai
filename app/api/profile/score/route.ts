import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { calculateAndSaveScore } from "@/lib/creator-score";

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
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // Recalculate fresh
    await calculateAndSaveScore(user.id);

    const sql = getDb();
    const rows = await sql`
      SELECT creator_score, score_breakdown, score_updated_at
      FROM users WHERE id = ${user.id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      score: rows[0].creator_score,
      breakdown: rows[0].score_breakdown,
      updated_at: rows[0].score_updated_at,
    });
  } catch (e) {
    console.error("[API /profile/score GET] Error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
