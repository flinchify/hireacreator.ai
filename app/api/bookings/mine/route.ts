import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET /api/bookings/mine — all calendar bookings the logged-in user has made
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();

    // Match by client_id OR client_email (for bookings made before user had account)
    const bookings = await sql`
      SELECT
        cb.id, cb.date, cb.start_time, cb.end_time, cb.timezone, cb.status,
        cb.notes, cb.stripe_payment_id, cb.created_at,
        cs.title AS session_title, cs.duration_minutes, cs.price_cents, cs.currency,
        u.id AS creator_id, u.full_name AS creator_name, u.avatar_url AS creator_avatar,
        u.slug AS creator_slug
      FROM calendar_bookings cb
      JOIN calendar_sessions cs ON cs.id = cb.session_id
      JOIN users u ON u.id = cb.creator_id
      WHERE cb.client_id = ${user.id} OR cb.client_email = ${user.email}
      ORDER BY cb.date DESC, cb.start_time DESC
    `;

    return NextResponse.json({ bookings });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}
