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

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { userId, verified } = await request.json();
    if (!userId || typeof verified !== "boolean") {
      return NextResponse.json({ error: "userId and verified (boolean) required" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      UPDATE users
      SET is_verified = ${verified},
          verification_method = 'admin'
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[verification/confirm]", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
