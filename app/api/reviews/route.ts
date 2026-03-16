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

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { bookingId, rating, comment } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "missing_booking", message: "A completed booking is required to leave a review." }, { status: 400 });
  }

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating", message: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const sql = getDb();

  // Verify the booking exists, belongs to this user, and is completed
  const bookings = await sql`
    SELECT id, creator_id, client_id, status
    FROM bookings
    WHERE id = ${bookingId}
    LIMIT 1
  `;

  if (bookings.length === 0) {
    return NextResponse.json({ error: "booking_not_found", message: "Booking not found." }, { status: 404 });
  }

  const booking = bookings[0];

  // Only the client (person who booked) can leave a review
  if (booking.client_id !== user.id) {
    return NextResponse.json({ error: "not_your_booking", message: "You can only review creators you've booked with." }, { status: 403 });
  }

  // Must be completed
  if (booking.status !== "completed") {
    return NextResponse.json({ error: "not_completed", message: "You can only review after the booking is completed." }, { status: 400 });
  }

  // Check if already reviewed this booking
  const existing = await sql`SELECT id FROM reviews WHERE booking_id = ${bookingId}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "already_reviewed", message: "You've already reviewed this booking." }, { status: 400 });
  }

  // Create the review
  const result = await sql`
    INSERT INTO reviews (booking_id, reviewer_id, creator_id, rating, comment)
    VALUES (${bookingId}, ${user.id}, ${booking.creator_id}, ${Math.round(rating)}, ${(comment || "").slice(0, 2000)})
    RETURNING id
  `;

  // Update creator's rating and review count
  await sql`
    UPDATE users SET
      review_count = (SELECT COUNT(*) FROM reviews WHERE creator_id = ${booking.creator_id}),
      rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE creator_id = ${booking.creator_id}),
      updated_at = NOW()
    WHERE id = ${booking.creator_id}
  `;

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}
