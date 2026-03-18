import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { verifyMPPPayment } from "@/lib/mpp";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "book");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { creatorId, serviceId, paymentIntentId, date, time } = body;

    if (!creatorId || !serviceId || !paymentIntentId) {
      return NextResponse.json(
        { error: "missing_fields", message: "creatorId, serviceId, and paymentIntentId are required." },
        { status: 400 }
      );
    }

    // Verify payment was completed
    const payment = await verifyMPPPayment(paymentIntentId);

    if (!payment.succeeded) {
      return NextResponse.json(
        {
          error: "payment_not_completed",
          message: `Payment status is '${payment.status}'. Payment must be completed before booking.`,
          payment_status: payment.status,
        },
        { status: 402 }
      );
    }

    // Verify the payment metadata matches the request
    if (payment.metadata.creator_id !== creatorId || payment.metadata.service_id !== serviceId) {
      return NextResponse.json(
        { error: "payment_mismatch", message: "Payment does not match the requested creator and service." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Find the existing pending booking for this payment intent
    const bookings = await sql`
      SELECT id, status FROM bookings
      WHERE stripe_payment_intent_id = ${paymentIntentId}
        AND client_id = ${auth.key.userId}
    `;

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: "booking_not_found", message: "No pending booking found for this payment." },
        { status: 404 }
      );
    }

    const booking = bookings[0];

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "booking_already_confirmed", message: `Booking is already '${booking.status}'.` },
        { status: 409 }
      );
    }

    // Update booking to accepted and set due date if provided
    const dueDate = date || null;
    const updated = await sql`
      UPDATE bookings
      SET status = 'accepted',
          due_date = COALESCE(${dueDate}::date, due_date),
          updated_at = NOW()
      WHERE id = ${booking.id}
      RETURNING id, service_id, creator_id, client_id, status, amount, currency, stripe_payment_intent_id, brief, due_date, created_at, updated_at
    `;

    return NextResponse.json({
      success: true,
      booking: updated[0],
      message: "Booking confirmed. The creator will be notified.",
    });
  } catch (err: any) {
    console.error("[MPP Book Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Booking confirmation failed. Please try again." },
      { status: 500 }
    );
  }
}
