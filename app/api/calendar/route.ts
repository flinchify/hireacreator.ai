import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET /api/calendar — get my sessions + availability
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const sql = getDb();

    const sessions = await sql`SELECT * FROM calendar_sessions WHERE user_id = ${user.id} ORDER BY created_at`;
    const availability = await sql`SELECT * FROM availability_slots WHERE user_id = ${user.id} AND is_active = true ORDER BY day_of_week, start_time`;
    const bookings = await sql`
      SELECT cb.*, cs.title as session_title, cs.duration_minutes, u.full_name as client_name_user
      FROM calendar_bookings cb
      JOIN calendar_sessions cs ON cs.id = cb.session_id
      LEFT JOIN users u ON u.id = cb.client_id
      WHERE cb.creator_id = ${user.id} AND cb.date >= CURRENT_DATE
      ORDER BY cb.date, cb.start_time
    `;

    return NextResponse.json({
      calendarEnabled: user.calendar_enabled || false,
      sessions,
      availability,
      bookings,
    });
  } catch (e: any) {
    console.error("Calendar GET error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/calendar — create a session type
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const { title, description, durationMinutes, priceCents, currency, color } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const sql = getDb();
    const session = await sql`
      INSERT INTO calendar_sessions (user_id, title, description, duration_minutes, price_cents, currency, color)
      VALUES (${user.id}, ${title.trim()}, ${description?.trim() || null}, ${durationMinutes || 30}, ${priceCents || 0}, ${currency || "AUD"}, ${color || "#171717"})
      RETURNING *
    `;

    // Enable calendar if first session
    await sql`UPDATE users SET calendar_enabled = true, updated_at = NOW() WHERE id = ${user.id}`;

    return NextResponse.json({ session: session[0] });
  } catch (e: any) {
    console.error("Calendar POST error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PATCH /api/calendar — update a session or toggle calendar
export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const sql = getDb();

    if (body.calendarEnabled !== undefined) {
      await sql`UPDATE users SET calendar_enabled = ${body.calendarEnabled}, updated_at = NOW() WHERE id = ${user.id}`;
      return NextResponse.json({ success: true });
    }

    if (body.sessionId) {
      await sql`
        UPDATE calendar_sessions SET
          title = COALESCE(${body.title ?? null}, title),
          description = COALESCE(${body.description ?? null}, description),
          duration_minutes = COALESCE(${body.durationMinutes ?? null}, duration_minutes),
          price_cents = COALESCE(${body.priceCents ?? null}, price_cents),
          is_active = COALESCE(${body.isActive ?? null}, is_active),
          updated_at = NOW()
        WHERE id = ${body.sessionId} AND user_id = ${user.id}
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (e: any) {
    console.error("Calendar PATCH error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/calendar — delete a session
export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const sql = getDb();
    await sql`DELETE FROM calendar_sessions WHERE id = ${sessionId} AND user_id = ${user.id}`;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Calendar DELETE error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
