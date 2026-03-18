import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { checkPaymentRateLimit, createAgentBookingWithPayment } from "@/lib/mpp";

export async function POST(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "book");
    if (!auth.ok) return auth.response;

    // Payment-specific rate limit
    const rateCheck = checkPaymentRateLimit(auth.key.keyId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: `Too many hire requests. Retry after ${rateCheck.retryAfter}s.`,
          retryAfter: rateCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { creatorId, serviceId, brief, dueDate, paymentMethod } = body;

    if (!creatorId || !serviceId) {
      return NextResponse.json(
        { error: "missing_fields", message: "creatorId and serviceId are required." },
        { status: 400 }
      );
    }

    if (paymentMethod && !["crypto", "card"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "invalid_payment_method", message: "paymentMethod must be 'crypto' or 'card'." },
        { status: 400 }
      );
    }

    const result = await createAgentBookingWithPayment({
      agentKeyId: auth.key.keyId,
      agentUserId: auth.key.userId,
      creatorId,
      serviceId,
      paymentMethod: paymentMethod || "card",
      brief,
      dueDate,
    });

    if ("error" in result) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Hire initiated. Complete payment using the client_secret, then the booking will be confirmed.",
      booking: result.booking,
      payment: {
        payment_intent_id: result.payment.payment_intent_id,
        client_secret: result.payment.client_secret,
        amount: result.payment.amount,
        currency: result.payment.currency,
        status: result.payment.status,
        method: paymentMethod || "card",
      },
      service: result.service,
      next_steps: [
        "1. Use the client_secret to confirm payment via Stripe (card) or deposit stablecoins (crypto).",
        "2. Once payment succeeds, POST /api/agent/book with { creatorId, serviceId, paymentIntentId } to finalize.",
        "Or: If using Stripe auto-confirm, the booking will be confirmed automatically via webhook.",
      ],
    });
  } catch (err: any) {
    console.error("[Agent Hire Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Hire request failed. Please try again." },
      { status: 500 }
    );
  }
}
