import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { getStripe, MARKETPLACE_FEE_PERCENT, ENTERPRISE_FEE_PERCENT } from "@/lib/stripe";

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
  const { serviceId, brief, packageId } = body;

  if (!serviceId) {
    return NextResponse.json({ error: "missing_service_id" }, { status: 400 });
  }

  const sql = getDb();

  // Get service + creator details
  const services = await sql`
    SELECT s.id, s.title, s.price, s.currency, s.user_id AS creator_id,
           u.full_name AS creator_name, u.stripe_account_id
    FROM services s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${serviceId} AND s.is_active = true
  `;

  if (services.length === 0) {
    return NextResponse.json({ error: "service_not_found" }, { status: 404 });
  }

  const service = services[0];

  // If packageId provided, use package price instead
  if (packageId) {
    const pkgs = await sql`
      SELECT * FROM service_packages WHERE id = ${packageId} AND service_id = ${serviceId}
    `;
    if (pkgs.length > 0) {
      service.price = pkgs[0].price;
      service.title = `${service.title} — ${(pkgs[0].title as string)}`;
    }
  }

  if (!service.stripe_account_id) {
    return NextResponse.json(
      { error: "creator_not_onboarded", message: "This creator hasn't set up payments yet." },
      { status: 400 }
    );
  }

  if (service.price === 0) {
    return NextResponse.json(
      { error: "free_service", message: "This is a sponsorship listing. Contact the creator directly." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Check if brand has enterprise subscription (5% fee instead of 10%)
  let feePercent = MARKETPLACE_FEE_PERCENT;
  if (user.stripe_customer_id) {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      limit: 10,
    });
    const hasEnterprise = subscriptions.data.some(
      (sub) => sub.metadata?.plan === "brand_enterprise"
    );
    if (hasEnterprise) feePercent = ENTERPRISE_FEE_PERCENT;
  }

  // Calculate fee (applied on top of service price, paid by brand)
  const serviceAmount = service.price * 100; // cents
  const feeAmount = Math.round(serviceAmount * (feePercent / 100));
  const totalAmount = serviceAmount + feeAmount;

  // Get or create Stripe customer
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await sql`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}`;
  }

  // Create booking record
  const bookings = await sql`
    INSERT INTO bookings (service_id, client_id, creator_id, amount, currency, brief, status)
    VALUES (${service.id}, ${user.id}, ${service.creator_id}, ${service.price}, ${service.currency || 'USD'}, ${brief || ''}, 'pending')
    RETURNING id
  `;
  const bookingId = bookings[0].id;

  // Create Stripe Checkout with Connect (payment to creator, fee to platform)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [{
      price_data: {
        currency: (service.currency || "usd").toLowerCase(),
        unit_amount: totalAmount,
        product_data: {
          name: service.title,
          description: `Booking with ${service.creator_name} (incl. ${feePercent}% service fee)`,
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: feeAmount,
      transfer_data: {
        destination: service.stripe_account_id,
      },
      metadata: { bookingId, userId: user.id, creatorId: service.creator_id },
    },
    success_url: `${appUrl}/dashboard?booking=success&id=${bookingId}`,
    cancel_url: `${appUrl}/creators/${service.creator_id}?booking=cancelled`,
    metadata: { bookingId, userId: user.id, serviceId: service.id },
  });

  return NextResponse.json({ url: session.url, bookingId });
}
