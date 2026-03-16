import { NextResponse } from "next/server";
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

// DELETE — sign out all other sessions
export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const currentToken = cookies().get("session_token")?.value;
  const sql = getDb();

  await sql`
    DELETE FROM auth_sessions
    WHERE user_id = ${user.id} AND token != ${currentToken}
  `;

  return NextResponse.json({ success: true });
}
