import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET() {
  const token = cookies().get("session_token")?.value;
  if (!token) {
    return NextResponse.json({ 
      auth: false, 
      reason: "no_cookie",
      message: "No session_token cookie found. You need to sign in.",
      cookies: Object.fromEntries(cookies().getAll().map(c => [c.name, c.value.substring(0, 8) + "..."]))
    });
  }

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT u.id, u.full_name, u.slug, u.email, s.expires_at
      FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
    
    if (rows.length === 0) {
      // Check if session exists but expired
      const expired = await sql`
        SELECT s.expires_at FROM auth_sessions s WHERE s.token = ${token}
      `;
      if (expired.length > 0) {
        return NextResponse.json({ 
          auth: false, 
          reason: "expired",
          message: "Session expired. Please sign out and sign back in.",
          expired_at: expired[0].expires_at
        });
      }
      return NextResponse.json({ 
        auth: false, 
        reason: "invalid_token",
        message: "Session token not found in database. Please sign out and sign back in."
      });
    }

    return NextResponse.json({ 
      auth: true, 
      user: rows[0].full_name,
      slug: rows[0].slug,
      session_expires: rows[0].expires_at,
      message: "Session is valid. Saves should work."
    });
  } catch (e: any) {
    return NextResponse.json({ 
      auth: false, 
      reason: "db_error",
      message: "Database connection error: " + e.message
    });
  }
}
