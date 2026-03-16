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

  const body = await request.json().catch(() => ({}));
  const { animationType } = body;

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create customer
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
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: 499, // $4.99
        product_data: {
          name: "AI Profile Animation",
          description: `Custom AI-generated intro animation for your creator profile. Style: ${animationType || "auto"}`,
        },
      },
      quantity: 1,
    }],
    success_url: `${appUrl}/dashboard?animation=success&type=${animationType || "auto"}`,
    cancel_url: `${appUrl}/dashboard?animation=cancelled`,
    metadata: { userId: user.id, type: "animation", animationType: animationType || "auto" },
  });

  return NextResponse.json({ url: session.url });
}
