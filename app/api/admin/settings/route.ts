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

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const sql = getDb();
  const rows = await sql`SELECT key, value FROM site_settings`;
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key as string] = r.value as string;
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const sql = getDb();
  for (const [key, value] of Object.entries(body)) {
    await sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${value as string}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${value as string}, updated_at = NOW()
    `;
  }
  return NextResponse.json({ success: true });
}
