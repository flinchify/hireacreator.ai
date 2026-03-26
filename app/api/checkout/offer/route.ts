import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.role, u.stripe_customer_id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.role !== "brand" && user.role !== "admin") {
    return NextResponse.json({ error: "Only brands can pay for offers" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const { offer_id } = body;

  if (!offer_id) {
    return NextResponse.json({ error: "missing_offer_id" }, { status: 400 });
  }

  const sql = getDb();

  // Get the offer and verify ownership + status
  const offers = await sql`
    SELECT o.*, u.stripe_account_id as creator_stripe_account_id
    FROM offers o
    LEFT JOIN users u ON u.id = o.creator_user_id
    WHERE o.id = ${offer_id} LIMIT 1
  `;

  if (offers.length === 0) {
    return NextResponse.json({ error: "offer_not_found" }, { status: 404 });
  }

  const offer = offers[0];

  // Verify the brand owns this offer
  if (offer.brand_user_id !== user.id) {
    return NextResponse.json({ error: "not_your_offer" }, { status: 403 });
  }

  // Allow payment for pending or accepted offers
  if (!["pending", "accepted"].includes(offer.status)) {
    return NextResponse.json({ error: "offer_not_payable", message: "Offer must be pending or accepted before payment" }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create Stripe customer for the brand
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}`;
  }

  const budgetCents = offer.budget_cents as number;
  const feeCents = (offer.fee_cents as number) || 0;
  const totalCents = budgetCents + feeCents;

  // Build checkout session config
  const sessionConfig: any = {
    customer: customerId,
    mode: "payment" as const,
    line_items: [{
      price_data: {
        currency: "aud",
        unit_amount: totalCents,
        product_data: {
          name: `Offer to @${offer.creator_handle}`,
          description: `Creator deal: ${(offer.brief as string).slice(0, 200)}${feeCents > 0 ? ` (incl. $${(feeCents / 100).toFixed(2)} service fee)` : ""}`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      offer_id: offer.id,
      brand_user_id: user.id,
      creator_handle: offer.creator_handle,
    },
    success_url: `${appUrl}/dashboard?offer_paid=true&offer_id=${offer.id}`,
    cancel_url: `${appUrl}/dashboard?offer_cancelled=true`,
  };

  // If creator has Stripe Connect, route payment to them (minus platform fee)
  if (offer.creator_stripe_account_id) {
    sessionConfig.payment_intent_data = {
      application_fee_amount: feeCents,
      transfer_data: {
        destination: offer.creator_stripe_account_id,
      },
      metadata: {
        offer_id: offer.id,
        brand_user_id: user.id,
        creator_handle: offer.creator_handle,
      },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  // Save checkout ID to offer
  await sql`
    UPDATE offers SET stripe_checkout_id = ${session.id}, updated_at = NOW()
    WHERE id = ${offer_id}
  `;

  return NextResponse.json({ url: session.url, checkout_id: session.id });
}
