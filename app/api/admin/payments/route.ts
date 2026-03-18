import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

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

// GET /api/admin/payments — all platform payments for admin feed
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const sql = getDb();

    // Calendar bookings (paid)
    const calendarBookings = await sql`
      SELECT
        cb.id, cb.date, cb.status, cb.stripe_payment_id, cb.created_at,
        cs.title AS description, cs.price_cents AS amount_cents, cs.currency,
        cb.client_email AS payer_email,
        client.full_name AS payer_name,
        creator.full_name AS recipient_name, creator.slug AS recipient_slug
      FROM calendar_bookings cb
      JOIN calendar_sessions cs ON cs.id = cb.session_id
      LEFT JOIN users client ON client.id = cb.client_id
      JOIN users creator ON creator.id = cb.creator_id
      WHERE cs.price_cents > 0
      ORDER BY cb.created_at DESC
      LIMIT 100
    `;

    // Service bookings
    const serviceBookings = await sql`
      SELECT
        b.id, b.status, b.amount AS amount_cents, b.currency, b.stripe_payment_intent_id,
        b.created_at, s.title AS description,
        client.full_name AS payer_name, client.email AS payer_email,
        creator.full_name AS recipient_name, creator.slug AS recipient_slug
      FROM bookings b
      JOIN services s ON s.id = b.service_id
      LEFT JOIN users client ON client.id = b.client_id
      JOIN users creator ON creator.id = b.creator_id
      ORDER BY b.created_at DESC
      LIMIT 100
    `;

    // Combine and normalize into unified payment rows
    const payments: any[] = [];

    for (const cb of calendarBookings) {
      payments.push({
        id: cb.id,
        type: "booking",
        description: cb.description,
        amount_cents: cb.amount_cents,
        currency: cb.currency || "AUD",
        payer_name: cb.payer_name || cb.payer_email || "Guest",
        payer_email: cb.payer_email,
        recipient_name: cb.recipient_name,
        recipient_slug: cb.recipient_slug,
        status: cb.status,
        stripe_id: cb.stripe_payment_id,
        created_at: cb.created_at,
      });
    }

    for (const sb of serviceBookings) {
      payments.push({
        id: sb.id,
        type: "service",
        description: sb.description,
        amount_cents: sb.amount_cents,
        currency: sb.currency || "USD",
        payer_name: sb.payer_name || sb.payer_email || "Unknown",
        payer_email: sb.payer_email,
        recipient_name: sb.recipient_name,
        recipient_slug: sb.recipient_slug,
        status: sb.status,
        stripe_id: sb.stripe_payment_intent_id,
        created_at: sb.created_at,
      });
    }

    // Fetch recent Stripe charges as source of truth
    let stripeCharges: any[] = [];
    try {
      const stripe = getStripe();
      const charges = await stripe.charges.list({ limit: 50 });
      stripeCharges = charges.data.map((c) => ({
        id: c.id,
        type: c.metadata?.bookingId ? "booking" : c.metadata?.serviceId ? "service" : c.description?.toLowerCase().includes("boost") ? "boost" : c.description?.toLowerCase().includes("animation") ? "animation" : "subscription",
        description: c.description || c.metadata?.productName || "Stripe charge",
        amount_cents: c.amount,
        currency: c.currency.toUpperCase(),
        payer_name: c.billing_details?.name || c.metadata?.userId || "Unknown",
        payer_email: c.billing_details?.email || c.receipt_email || null,
        recipient_name: c.metadata?.creatorId || null,
        recipient_slug: null,
        status: c.status === "succeeded" ? "confirmed" : c.status === "pending" ? "pending" : c.refunded ? "refunded" : c.status,
        stripe_id: c.id,
        created_at: new Date(c.created * 1000).toISOString(),
      }));
    } catch {
      // Stripe may not be configured — continue with DB data only
    }

    // Merge: use Stripe charges but avoid duplicates (match by stripe_id)
    const dbStripeIds = new Set(payments.map((p) => p.stripe_id).filter(Boolean));
    for (const sc of stripeCharges) {
      if (!dbStripeIds.has(sc.stripe_id)) {
        payments.push(sc);
      }
    }

    // Sort by created_at descending
    payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Revenue summaries
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let revenueToday = 0, revenueWeek = 0, revenueMonth = 0;
    for (const p of payments) {
      if (p.status !== "confirmed" && p.status !== "succeeded") continue;
      const d = new Date(p.created_at);
      const cents = Number(p.amount_cents) || 0;
      if (d >= todayStart) revenueToday += cents;
      if (d >= weekStart) revenueWeek += cents;
      if (d >= monthStart) revenueMonth += cents;
    }

    return NextResponse.json({
      payments: payments.slice(0, 100),
      revenue: {
        today_cents: revenueToday,
        week_cents: revenueWeek,
        month_cents: revenueMonth,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}
