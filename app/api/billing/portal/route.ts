import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const token = cookies().get("session_token")?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.stripe_customer_id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  if (rows.length === 0) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = rows[0];
  if (!user.stripe_customer_id) {
    return NextResponse.json({ error: "no_subscription", message: "No active subscription found. You need to subscribe first." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/dashboard/settings?tab=plan`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("Billing portal error:", e);
    return NextResponse.json({ error: "portal_error", message: e.message || "Could not create billing portal session" }, { status: 500 });
  }
}
