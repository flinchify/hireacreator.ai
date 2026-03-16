import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe, PRICES } from "@/lib/stripe";

const VALID_PLANS: Record<string, string> = {
  creator_pro: PRICES.CREATOR_PRO,
  creator_biz: PRICES.CREATOR_BIZ,
  brand_analytics: PRICES.BRAND_ANALYTICS,
  brand_enterprise: PRICES.BRAND_ENTERPRISE,
  api_pro: PRICES.API_PRO,
  boosted: PRICES.BOOSTED,
};

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

  const body = await request.json().catch(() => ({}));
  const plan = body.plan as string;

  if (!plan || !VALID_PLANS[plan]) {
    return NextResponse.json(
      { error: "invalid_plan", valid: Object.keys(VALID_PLANS) },
      { status: 400 }
    );
  }

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

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: VALID_PLANS[plan], quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscription=success&plan=${plan}`,
    cancel_url: `${appUrl}/pricing?cancelled=true`,
    metadata: { userId: user.id, plan },
    subscription_data: {
      metadata: { userId: user.id, plan },
    },
  });

  return NextResponse.json({ url: session.url });
}
