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
            brand_pro: { field: "subscription_tier", value: "pro" },
            brand_enterprise: { field: "subscription_tier", value: "enterprise" },
            api_pro: { field: "subscription_tier", value: "api_pro" },
          };

          // Boosted listing — don't change subscription tier, set boost flag
          if (plan === "boosted") {
            await sql`UPDATE users SET is_boosted = TRUE, boosted_until = NOW() + INTERVAL '7 days', updated_at = NOW() WHERE id = ${userId}`;
            console.log(`Boost activated for user ${userId}`);
          } else {
            const tier = tierMap[plan]?.value || plan;
            await sql`UPDATE users SET subscription_tier = ${tier}, updated_at = NOW() WHERE id = ${userId}`;
            console.log(`Subscription ${sub.status} for user ${userId}: ${tier}`);

            // Mark any referral as active (they're paying now)
            if (sub.status === "active") {
              await sql`
                UPDATE referrals SET status = 'active', tier = ${tier}
                WHERE referred_id = ${userId} AND status = 'signed_up'
              `;
            }
          }
        }
        break;
      }

      // Subscription cancelled
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan;
        if (userId) {
          if (plan === "boosted") {
            await sql`UPDATE users SET is_boosted = FALSE, boosted_until = NULL, updated_at = NOW() WHERE id = ${userId}`;
            console.log(`Boost cancelled for user ${userId}`);
          } else {
            await sql`UPDATE users SET subscription_tier = 'free', updated_at = NOW() WHERE id = ${userId}`;
            await sql`UPDATE referrals SET status = 'churned', tier = 'free' WHERE referred_id = ${userId} AND status = 'active'`;
            console.log(`Subscription cancelled for user ${userId}`);
          }
        }
        break;
      }

      // Invoice paid (subscription renewals) — trigger referral commissions
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const amountCents = invoice.amount_paid;
        console.log(`Invoice ${invoice.id} paid: $${(amountCents / 100).toFixed(2)}`);

        // Find user by Stripe customer ID
        if (invoice.customer && amountCents > 0) {
          const payer = await sql`SELECT id FROM users WHERE stripe_customer_id = ${invoice.customer as string}`;
          if (payer.length > 0) {
            // Check if this user was referred
            const ref = await sql`
              SELECT * FROM referrals
              WHERE referred_id = ${payer[0].id}
                AND status = 'active'
                AND expires_at > NOW()
            `;
            if (ref.length > 0) {
              const commission = Math.floor(amountCents * (ref[0].commission_percent as number) / 100);
              if (commission > 0) {
                // Log the commission + add as platform credits
                await sql`
                  INSERT INTO referral_commissions (referral_id, referrer_id, amount_cents, source_event, stripe_invoice_id, credited)
                  VALUES (${ref[0].id}, ${ref[0].referrer_id}, ${commission}, ${'invoice.paid'}, ${invoice.id}, true)
                `;
                // Update totals + add credits to referrer's balance
                await sql`UPDATE referrals SET total_earned_cents = total_earned_cents + ${commission} WHERE id = ${ref[0].id}`;
                await sql`UPDATE users SET referral_earnings_cents = referral_earnings_cents + ${commission}, credit_balance_cents = credit_balance_cents + ${commission} WHERE id = ${ref[0].referrer_id}`;
                console.log(`Referral credit: $${(commission / 100).toFixed(2)} added to referrer ${ref[0].referrer_id}`);
              }
            }
          }
        }
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

        // Handle offer payment completion
        const offerId = session.metadata?.offer_id;
        if (offerId) {
          const paymentIntentId = typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id || null;

          await sql`
            UPDATE offers
            SET status = 'paid',
                stripe_payment_intent_id = ${paymentIntentId},
                updated_at = NOW()
            WHERE id = ${offerId} AND status = 'accepted'
          `;
          console.log(`Offer ${offerId} marked as paid, pi=${paymentIntentId}`);
        }
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
