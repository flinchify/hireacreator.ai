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

// POST /api/calendar/availability — set weekly availability
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const { slots } = body; // Array of { dayOfWeek, startTime, endTime, timezone }

    if (!Array.isArray(slots)) return NextResponse.json({ error: "slots array required" }, { status: 400 });

    const sql = getDb();

    // Replace all existing availability
    await sql`DELETE FROM availability_slots WHERE user_id = ${user.id}`;

    for (const slot of slots) {
      if (slot.dayOfWeek == null || !slot.startTime || !slot.endTime) continue;
      await sql`
        INSERT INTO availability_slots (user_id, day_of_week, start_time, end_time, timezone)
        VALUES (${user.id}, ${slot.dayOfWeek}, ${slot.startTime}, ${slot.endTime}, ${slot.timezone || "Australia/Sydney"})
      `;
    }

    return NextResponse.json({ success: true, count: slots.length });
  } catch (e: any) {
    console.error("Availability POST error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
