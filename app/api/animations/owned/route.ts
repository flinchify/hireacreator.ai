import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET() {
  const token = cookies().get("session_token")?.value;
  if (!token) return NextResponse.json({ animations: [] });

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT pa.animation_type 
      FROM profile_animations pa
      JOIN auth_sessions s ON s.user_id = pa.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW() AND pa.is_active = TRUE
    `;
    return NextResponse.json({ animations: rows.map((r: any) => r.animation_type) });
  } catch {
    return NextResponse.json({ animations: [] });
  }
}
