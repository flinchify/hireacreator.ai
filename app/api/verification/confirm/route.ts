import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const ADMIN_EMAILS = ["inpromptyou@gmail.com", "flinchify@gmail.com"];

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  if (!ADMIN_EMAILS.includes(rows[0].email as string) && rows[0].role !== "admin") return null;
  return rows[0];
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const sql = getDb();
    await sql`
      UPDATE users
      SET is_verified = true,
          verification_method = 'admin',
          verification_checked_at = NOW(),
          pending_verification = false
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[verification/confirm]", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
