import { getStripe } from "./stripe";
import { getDb } from "./db";

// In-memory payment rate limiter: max 10 payments/minute per API key
const paymentWindows = new Map<string, { count: number; resetAt: number }>();

const MPP_PAYMENT_LIMIT = 10;
const MPP_WINDOW_MS = 60_000;

export function checkPaymentRateLimit(keyId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = paymentWindows.get(keyId);

  if (!entry || now > entry.resetAt) {
    paymentWindows.set(keyId, { count: 1, resetAt: now + MPP_WINDOW_MS });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > MPP_PAYMENT_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true };
}

/**
 * Create an MPP-compatible Stripe PaymentIntent.
 */
export async function createMPPPaymentRequest(
  amount: number,
  currency: string,
  description: string,
  metadata: Record<string, string>
) {
  const stripe = getStripe();

  const paymentMethodTypes: string[] = ["card"];
  // Stripe supports crypto via custom payment method — add if available
  if (metadata.payment_method === "crypto") {
    paymentMethodTypes.push("customer_balance");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    description,
    payment_method_types: paymentMethodTypes,
    metadata: {
      ...metadata,
      mpp: "true",
      source: "hireacreator_agent_api",
    },
  });

  return {
    payment_intent_id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status,
  };
}

/**
 * Verify an MPP payment was completed successfully.
 */
export async function verifyMPPPayment(paymentIntentId: string) {
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    succeeded: paymentIntent.status === "succeeded",
    metadata: paymentIntent.metadata,
  };
}

/**
 * Full agent booking + payment flow.
 * Validates agent, checks service, creates payment, creates booking record.
 */
export async function createAgentBookingWithPayment(params: {
  agentKeyId: string;
  agentUserId: string;
  creatorId: string;
  serviceId: string;
  paymentMethod: "crypto" | "card";
  brief?: string;
  dueDate?: string;
}) {
  const sql = getDb();

  // Validate service exists and belongs to creator
  const services = await sql`
    SELECT s.id, s.title, s.price, s.currency, s.delivery_days, s.user_id, u.full_name AS creator_name, u.stripe_account_id
    FROM services s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${params.serviceId}
      AND s.user_id = ${params.creatorId}
      AND s.is_active = TRUE
  `;

  if (services.length === 0) {
    return { error: "service_not_found", message: "Service not found or not active for this creator." };
  }

  const service = services[0];
  const amount = service.price; // already in cents
  const currency = (service.currency || "AUD").toLowerCase();

  // Create MPP payment
  const payment = await createMPPPaymentRequest(amount, currency, `Booking: ${service.title} by ${service.creator_name}`, {
    payment_method: params.paymentMethod,
    agent_key_id: params.agentKeyId,
    agent_user_id: params.agentUserId,
    creator_id: params.creatorId,
    service_id: params.serviceId,
    type: "agent_booking",
  });

  // Calculate due date
  const dueDate = params.dueDate || new Date(Date.now() + service.delivery_days * 86400_000).toISOString().split("T")[0];

  // Create booking in pending state
  const bookings = await sql`
    INSERT INTO bookings (service_id, client_id, creator_id, status, amount, currency, stripe_payment_intent_id, brief, due_date)
    VALUES (${params.serviceId}, ${params.agentUserId}, ${params.creatorId}, 'pending', ${amount}, ${currency}, ${payment.payment_intent_id}, ${params.brief || null}, ${dueDate})
    RETURNING id, status, amount, currency, due_date, created_at
  `;

  // Log the transaction for audit
  await sql`
    INSERT INTO rate_limit_log (api_key_id, endpoint, ip_address)
    VALUES (${params.agentKeyId}, '/api/agent/pay', '0.0.0.0')
  `.catch(() => {});

  return {
    booking: bookings[0],
    payment,
    service: {
      id: service.id,
      title: service.title,
      price: service.price,
      currency: service.currency,
      delivery_days: service.delivery_days,
      creator_name: service.creator_name,
    },
  };
}
