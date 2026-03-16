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

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sql = getDb();

  await sql`
    UPDATE users SET
      privacy_profile_public = COALESCE(${body.profilePublic ?? null}, privacy_profile_public),
      privacy_show_email = COALESCE(${body.showEmail ?? null}, privacy_show_email),
      privacy_show_earnings = COALESCE(${body.showEarnings ?? null}, privacy_show_earnings),
      privacy_show_location = COALESCE(${body.showLocation ?? null}, privacy_show_location),
      privacy_allow_messages = COALESCE(${body.allowMessages ?? null}, privacy_allow_messages),
      privacy_searchable = COALESCE(${body.searchable ?? null}, privacy_searchable),
      visible_in_marketplace = COALESCE(${body.profilePublic ?? null}, visible_in_marketplace),
      updated_at = NOW()
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ success: true });
}
