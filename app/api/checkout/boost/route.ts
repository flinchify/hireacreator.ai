import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe, PRICES } from "@/lib/stripe";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.stripe_customer_id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized", message: "Please sign in first." }, { status: 401 });

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      const sql = getDb();
      await sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}`;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICES.BOOSTED, quantity: 1 }],
      success_url: `${appUrl}/dashboard?subscription=success&plan=boosted`,
      cancel_url: `${appUrl}/dashboard?cancelled=true`,
      metadata: { userId: user.id, plan: "boosted" },
      subscription_data: {
        metadata: { userId: user.id, plan: "boosted" },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[CheckoutBoost]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
