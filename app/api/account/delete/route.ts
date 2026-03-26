import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAuthenticatedUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.role
    FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sql = getDb();

    // Add soft-delete columns if they don't exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`.catch(() => {});
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`.catch(() => {});

    // Cancel all pending offers where user is the brand
    await sql`
      UPDATE offers SET status = 'cancelled', updated_at = NOW()
      WHERE brand_user_id = ${user.id}
      AND status IN ('pending', 'viewed', 'countered')
    `;

    // Cancel all pending offers where user is the creator
    await sql`
      UPDATE offers SET status = 'cancelled', updated_at = NOW()
      WHERE creator_user_id = ${user.id}
      AND status IN ('pending', 'viewed', 'countered')
    `;

    // Delete all auth sessions for this user
    await sql`DELETE FROM auth_sessions WHERE user_id = ${user.id}`;

    // Soft delete the user
    await sql`
      UPDATE users
      SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Clear the session cookie
    const response = NextResponse.json({ success: true, message: "Account deleted successfully" });
    response.cookies.set("session_token", "", { maxAge: 0, path: "/" });
    return response;

  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
