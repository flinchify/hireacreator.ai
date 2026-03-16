import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const sql = getDb();

  try {
    switch (event.type) {
      // Booking payment succeeded
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          await sql`
            UPDATE bookings SET status = 'accepted', stripe_payment_intent_id = ${pi.id}, updated_at = NOW()
            WHERE id = ${bookingId}
          `;
          console.log(`Booking ${bookingId} paid via ${pi.id}`);
        }
        break;
      }

      // Booking payment failed
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.bookingId;
        if (bookingId) {
          await sql`
            UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ${bookingId}
          `;
          console.log(`Booking ${bookingId} payment failed`);
        }
        break;
      }

      // Subscription created
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan;
        if (userId && plan) {
          // Update user's subscription tier based on plan
          const tierMap: Record<string, { field: string; value: string }> = {
            creator_pro: { field: "subscription_tier", value: "pro" },
            creator_biz: { field: "subscription_tier", value: "business" },
            brand_analytics: { field: "subscription_tier", value: "analytics" },
            brand_enterprise: { field: "subscription_tier", value: "enterprise" },
            api_pro: { field: "subscription_tier", value: "api_pro" },
          };

          // For now just log — subscription_tier column can be added later
          console.log(`Subscription ${sub.status} for user ${userId}: ${plan}`);
        }
        break;
      }

      // Subscription cancelled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (userId) {
          console.log(`Subscription cancelled for user ${userId}`);
        }
        break;
      }

      // Invoice paid (subscription renewals)
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice ${invoice.id} paid: $${(invoice.amount_paid / 100).toFixed(2)}`);
        break;
      }

      // Invoice payment failed
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice ${invoice.id} payment failed for customer ${invoice.customer}`);
        break;
      }

      // Stripe Connect: creator account updated
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        if (account.charges_enabled) {
          // Creator can now receive payments
          await sql`
            UPDATE users SET stripe_account_id = ${account.id}, updated_at = NOW()
            WHERE stripe_account_id = ${account.id}
          `;
          console.log(`Connect account ${account.id} is now active`);
        }
        break;
      }

      // Checkout session completed (catch-all)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout completed: ${session.id} mode=${session.mode}`);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err);
    // Still return 200 so Stripe doesn't retry
  }

  return NextResponse.json({ received: true });
}
