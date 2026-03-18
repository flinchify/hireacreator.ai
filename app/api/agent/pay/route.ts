import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { checkPaymentRateLimit, createAgentBookingWithPayment } from "@/lib/mpp";

export async function POST(request: Request) {
  try {
    // Authenticate with "book" scope (payments require booking permission)
    const auth = await authenticateApiRequest(request, "book");
    if (!auth.ok) return auth.response;

    // Payment-specific rate limit (10/min per key)
    const rateCheck = checkPaymentRateLimit(auth.key.keyId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "payment_rate_limited",
          message: `Too many payment requests. Retry after ${rateCheck.retryAfter}s.`,
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

    const { creatorId, serviceId, paymentMethod, brief, dueDate } = body;

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
    });
  } catch (err: any) {
    console.error("[MPP Pay Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}
