import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { platform, handle, url } = body;

  if (!platform || !handle) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const sql = getDb();
  // Max 15 social links
  const count = await sql`SELECT COUNT(*)::int AS cnt FROM social_connections WHERE user_id = ${user.id}`;
  if ((count[0]?.cnt || 0) >= 15) {
    return NextResponse.json({ error: "max_socials", message: "Maximum 15 social links." }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO social_connections (user_id, platform, handle, url)
    VALUES (${user.id}, ${platform.toLowerCase()}, ${handle}, ${url || null})
    RETURNING id
  `;

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM social_connections WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ success: true });
}
