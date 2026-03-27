import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

const ADMIN_EMAILS = ["inpromptyou@gmail.com", "flinchify@gmail.com"];

async function getAdminUser() {
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

// PATCH — Admin manually verify a user
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const sql = getDb();

    // Ensure columns exist
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method TEXT`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMPTZ`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT FALSE`;
    } catch {
      // Columns may already exist
    }

    await sql`
      UPDATE users SET
        is_verified = TRUE,
        verification_status = 'verified',
        verification_method = 'admin',
        verification_checked_at = NOW(),
        pending_verification = FALSE,
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verification/confirm] error:", err);
    return NextResponse.json({ error: "Failed to confirm verification" }, { status: 500 });
  }
}
