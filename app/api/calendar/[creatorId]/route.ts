import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/calendar/[creatorId] — public: get creator's sessions + available dates
export async function GET(request: Request, { params }: { params: { creatorId: string } }) {
  try {
    const sql = getDb();
    const creatorId = params.creatorId;

    // Check creator exists and has calendar enabled
    const creator = await sql`SELECT id, full_name, calendar_enabled, slug FROM users WHERE id = ${creatorId} AND calendar_enabled = true`;
    if (creator.length === 0) return NextResponse.json({ error: "Calendar not available" }, { status: 404 });

    // Get active session types
    const sessions = await sql`
      SELECT id, title, description, duration_minutes, price_cents, currency, color
      FROM calendar_sessions WHERE user_id = ${creatorId} AND is_active = true
      ORDER BY price_cents ASC
    `;

    // Get availability
    const availability = await sql`
      SELECT day_of_week, start_time, end_time, timezone
      FROM availability_slots WHERE user_id = ${creatorId} AND is_active = true
      ORDER BY day_of_week, start_time
    `;

    // Get existing bookings for next 60 days (to show as unavailable)
    const bookings = await sql`
      SELECT date, start_time, end_time
      FROM calendar_bookings
      WHERE creator_id = ${creatorId} AND status IN ('confirmed', 'pending')
        AND date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '60 days'
    `;

    return NextResponse.json({
      creator: creator[0],
      sessions,
      availability,
      bookedSlots: bookings,
    });
  } catch (e: any) {
    console.error("Public calendar GET error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/calendar/[creatorId] — book a session
export async function POST(request: Request, { params }: { params: { creatorId: string } }) {
  try {
    const sql = getDb();
    const body = await request.json().catch(() => ({}));
    const { sessionId, date, startTime, clientName, clientEmail, notes } = body;

    if (!sessionId || !date || !startTime || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify session exists and belongs to creator
    const session = await sql`
      SELECT * FROM calendar_sessions WHERE id = ${sessionId} AND user_id = ${params.creatorId} AND is_active = true
    `;
    if (session.length === 0) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const sess = session[0];
    const durMinutes = sess.duration_minutes as number;

    // Calculate end time
    const [h, m] = (startTime as string).split(":").map(Number);
    const endMinutes = h * 60 + m + durMinutes;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    // Check for conflicts
    const conflicts = await sql`
      SELECT id FROM calendar_bookings
      WHERE creator_id = ${params.creatorId} AND date = ${date} AND status IN ('confirmed', 'pending')
        AND start_time < ${endTime}::TIME AND end_time > ${startTime}::TIME
    `;
    if (conflicts.length > 0) return NextResponse.json({ error: "Time slot already booked" }, { status: 409 });

    // If paid session, create Stripe checkout
    const priceCents = sess.price_cents as number;
    if (priceCents > 0) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "stripe_not_configured", message: "Stripe is not configured. Add STRIPE_SECRET_KEY to environment variables." }, { status: 500 });
      }
      const Stripe = require("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const checkout = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: (sess.currency as string || "aud").toLowerCase(),
            product_data: { name: `${sess.title} — ${date} at ${startTime}` },
            unit_amount: priceCents,
          },
          quantity: 1,
        }],
        metadata: {
          type: "calendar_booking",
          session_id: sessionId,
          creator_id: params.creatorId,
          date, start_time: startTime, end_time: endTime,
          client_name: clientName, client_email: clientEmail,
        },
        customer_email: clientEmail,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/booking/cancelled`,
      });

      // Create pending booking
      await sql`
        INSERT INTO calendar_bookings (session_id, creator_id, client_name, client_email, date, start_time, end_time, status, stripe_payment_id, notes)
        VALUES (${sessionId}, ${params.creatorId}, ${clientName}, ${clientEmail}, ${date}, ${startTime}, ${endTime}, 'pending', ${checkout.id}, ${notes || null})
      `;

      return NextResponse.json({ checkoutUrl: checkout.url });
    }

    // Free session — confirm immediately
    const booking = await sql`
      INSERT INTO calendar_bookings (session_id, creator_id, client_name, client_email, date, start_time, end_time, status, notes)
      VALUES (${sessionId}, ${params.creatorId}, ${clientName}, ${clientEmail}, ${date}, ${startTime}, ${endTime}, 'confirmed', ${notes || null})
      RETURNING id
    `;

    return NextResponse.json({ success: true, bookingId: booking[0].id });
  } catch (e: any) {
    console.error("Calendar booking error:", e);
    const msg = e.type === "StripeInvalidRequestError" ? e.message : (e.message || "Unknown error");
    return NextResponse.json({ error: "server_error", message: msg }, { status: 500 });
  }
}
