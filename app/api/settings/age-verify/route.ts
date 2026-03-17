import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// POST /api/settings/age-verify — self-declare 18+
export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    if (user.age_verified) {
      return NextResponse.json({ success: true, message: "Already verified." });
    }

    const sql = getDb();
    await sql`UPDATE users SET age_verified = true, age_verified_at = NOW(), updated_at = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({ success: true, message: "Age verified. You can now use messaging." });
  } catch (e: any) {
    console.error("Age verify error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
