import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { logAgentActivity } from "@/lib/agent-activity";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "book");
    if (!auth.ok) return auth.response;

    const sql = getDb();
    const userId = auth.key.userId;

    // Check Stripe connected account
    const users = await sql`SELECT stripe_account_id, full_name FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return NextResponse.json(
        { error: "profile_not_found", message: "No profile found." },
        { status: 404 }
      );
    }

    const stripeAccountId = users[0].stripe_account_id;
    if (!stripeAccountId) {
      return NextResponse.json(
        {
          error: "no_stripe_account",
          message: "No connected Stripe account. Set up Stripe Connect in your dashboard to receive payouts.",
        },
        { status: 400 }
      );
    }

    // Calculate available balance from completed bookings
    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0)::int AS total_earned
      FROM bookings
      WHERE creator_id = ${userId} AND status = 'completed'
    `;
    const totalEarned = balanceResult[0]?.total_earned || 0;

    if (totalEarned <= 0) {
      return NextResponse.json(
        { error: "insufficient_balance", message: "No available balance to withdraw." },
        { status: 400 }
      );
    }

    // Trigger Stripe payout
    const stripe = getStripe();
    const payout = await stripe.payouts.create(
      {
        amount: totalEarned,
        currency: "usd",
        description: `HireACreator payout for ${users[0].full_name}`,
      },
      { stripeAccount: stripeAccountId }
    );

    logAgentActivity(auth.key.keyId, userId, "payout_requested", {
      amount: totalEarned,
      payout_id: payout.id,
    });

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : null,
      },
      message: "Payout initiated. Funds will arrive in your connected bank account.",
    });
  } catch (err: any) {
    console.error("[Agent Withdraw Error]", err);

    if (err.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "stripe_error", message: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error", message: "Failed to process withdrawal." },
      { status: 500 }
    );
  }
}
