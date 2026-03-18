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
        // Discovery
        mpp_info: {
          method: "GET",
          path: "/api/agent/mpp-info",
          description: "This endpoint. Returns MPP service discovery information.",
          requires_scope: null,
        },
        // Profile management — agents can create and manage their own link-in-bio presence
        profile_get: {
          method: "GET",
          path: "/api/agent/profile",
          description: "Get the agent's own profile with socials and services.",
          requires_scope: "read",
        },
        profile_create: {
          method: "POST",
          path: "/api/agent/profile",
          description: "Create a link-in-bio profile for the agent. Body: { name, slug, bio, category, template?, avatar_url?, cover_url?, website? }",
          requires_scope: "write",
        },
        profile_update: {
          method: "PATCH",
          path: "/api/agent/profile",
          description: "Update the agent's profile fields (name, bio, slug, template, customization, etc.).",
          requires_scope: "write",
        },
        socials_add: {
          method: "POST",
          path: "/api/agent/profile/socials",
          description: "Add a social link to the agent's profile. Body: { platform, url, username? }",
          requires_scope: "write",
        },
        socials_remove: {
          method: "DELETE",
          path: "/api/agent/profile/socials",
          description: "Remove a social link. Body: { platform } or { connectionId }",
          requires_scope: "write",
        },
        services_list: {
          method: "GET",
          path: "/api/agent/profile/services",
          description: "List the agent's own services.",
          requires_scope: "read",
        },
        services_create: {
          method: "POST",
          path: "/api/agent/profile/services",
          description: "Create a service listing. Body: { title, description, price, currency?, delivery_days, category }",
          requires_scope: "write",
        },
        services_update: {
          method: "PATCH",
          path: "/api/agent/profile/services",
          description: "Update a service. Body: { serviceId, title?, description?, price?, is_active?, ... }",
          requires_scope: "write",
        },
        // Browsing creators
        creators_browse: {
          method: "GET",
          path: "/api/agent/creators",
          description: "Browse available creators. Query params: ?category=&search=&limit=&offset=",
          requires_scope: "read",
        },
        creators_detail: {
          method: "GET",
          path: "/api/agent/creators/{slug}",
          description: "Get a specific creator's full profile with services, portfolio, and reviews.",
          requires_scope: "read",
        },
        // Payment & booking
        hire: {
          method: "POST",
          path: "/api/agent/hire",
          description: "One-call hire: creates payment + booking in a single request. Body: { creatorId, serviceId, brief?, dueDate?, paymentMethod? }",
          requires_scope: "book",
        },
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
      },
      flows: {
        manage_profile: [
          "1. POST /api/agent/profile — Create your link-in-bio profile (name, slug, bio, category)",
          "2. POST /api/agent/profile/socials — Add social links (instagram, tiktok, etc.)",
          "3. POST /api/agent/profile/services — List your services with pricing",
          "4. PATCH /api/agent/profile — Customize template, colors, fonts, etc.",
        ],
        hire_creator: [
          "1. GET /api/agent/creators — Browse available creators (filter by category, search)",
          "2. GET /api/agent/creators/{slug} — View a creator's full profile and services",
          "3. POST /api/agent/hire — One-call hire: creates payment + booking (returns client_secret)",
          "4. Confirm payment using Stripe client_secret (card) or deposit stablecoins (crypto)",
          "5. POST /api/agent/book — Finalize booking after payment succeeds",
        ],
        legacy_pay_then_book: [
          "1. GET /api/agent/mpp-info — Discover available services and payment methods",
          "2. POST /api/agent/pay — Create payment for a service (returns payment_intent_id + client_secret)",
          "3. Confirm payment using Stripe client_secret (card) or deposit stablecoins (crypto)",
          "4. POST /api/agent/book — Confirm booking with paymentIntentId after payment succeeds",
        ],
      },
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
