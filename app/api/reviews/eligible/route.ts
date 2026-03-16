import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const token = cookies().get("session_token")?.value;
  if (!token) return NextResponse.json({ bookings: [] });

  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ bookings: [] });

  const sql = getDb();

  // Get user
  const users = await sql`
    SELECT u.id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  if (users.length === 0) return NextResponse.json({ bookings: [] });

  const userId = users[0].id;

  // Find completed bookings by this user with this creator that haven't been reviewed yet
  const bookings = await sql`
    SELECT b.id, b.completed_at, s.title AS service_title
    FROM bookings b
    JOIN services s ON s.id = b.service_id
    LEFT JOIN reviews r ON r.booking_id = b.id
    WHERE b.client_id = ${userId}
      AND b.creator_id = ${creatorId}
      AND b.status = 'completed'
      AND r.id IS NULL
    ORDER BY b.completed_at DESC
  `;

  return NextResponse.json({
    bookings: bookings.map(b => ({
      id: b.id,
      serviceTitle: b.service_title,
      completedAt: b.completed_at,
    })),
  });
}
