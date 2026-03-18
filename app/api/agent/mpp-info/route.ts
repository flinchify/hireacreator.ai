import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    // Get active services with creator info
    const services = await sql`
      SELECT s.id, s.title, s.description, s.price, s.currency, s.delivery_days, s.category,
             u.id AS creator_id, u.full_name AS creator_name, u.slug, u.category AS creator_category, u.rating
      FROM services s
      JOIN users u ON u.id = s.user_id
      WHERE s.is_active = TRUE AND u.visible_in_marketplace = TRUE
      ORDER BY u.rating DESC NULLS LAST
      LIMIT 100
    `;

    return NextResponse.json({
      name: "HireACreator.ai",
      description: "AI-native creator marketplace. Book content creators, UGC producers, video editors, designers and more via API.",
      version: "1.0",
      protocol: "machine-payments-protocol",
      mpp_version: "2025-01",
      base_url: "https://hireacreator.ai/api/agent",
      payment_methods: [
        {
          type: "card",
          description: "Standard card payment via Stripe. Returns a client_secret for payment confirmation.",
          currencies: ["aud", "usd"],
        },
        {
          type: "crypto",
          description: "Stablecoin payment via Stripe customer balance. Supports USDC deposits.",
          currencies: ["usd"],
        },
      ],
      endpoints: {
        pay: {
          method: "POST",
          path: "/api/agent/pay",
          description: "Create an MPP payment for a creator service. Returns payment intent details.",
          requires_scope: "book",
        },
        book: {
          method: "POST",
          path: "/api/agent/book",
          description: "Confirm a booking after payment is completed.",
          requires_scope: "book",
        },
        mpp_info: {
          method: "GET",
          path: "/api/agent/mpp-info",
          description: "This endpoint. Returns MPP service discovery information.",
          requires_scope: null,
        },
      },
      flow: [
        "1. GET /api/agent/mpp-info — Discover available services and payment methods",
        "2. POST /api/agent/pay — Create payment for a service (returns payment_intent_id + client_secret)",
        "3. Confirm payment using Stripe client_secret (card) or deposit stablecoins (crypto)",
        "4. POST /api/agent/book — Confirm booking with paymentIntentId after payment succeeds",
      ],
      rate_limits: {
        payments_per_minute: 10,
        bookings_per_hour: {
          free: 5,
          pro: 50,
          enterprise: 500,
        },
      },
      available_services: services.map((s: any) => ({
        service_id: s.id,
        title: s.title,
        description: s.description,
        price_cents: s.price,
        currency: s.currency || "AUD",
        delivery_days: s.delivery_days,
        category: s.category,
        creator: {
          id: s.creator_id,
          name: s.creator_name,
          slug: s.slug,
          category: s.creator_category,
          rating: parseFloat(s.rating) || 0,
        },
      })),
    });
  } catch (err: any) {
    console.error("[MPP Info Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to load MPP info." },
      { status: 500 }
    );
  }
}
