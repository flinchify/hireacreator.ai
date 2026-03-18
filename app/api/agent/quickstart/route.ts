import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { logAgentActivity } from "@/lib/agent-activity";

export async function POST(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "write");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { name, slug, bio, category, services, socials } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "missing_fields", message: "name and slug are required." },
        { status: 400 }
      );
    }

    if (services && !Array.isArray(services)) {
      return NextResponse.json(
        { error: "invalid_services", message: "services must be an array." },
        { status: 400 }
      );
    }

    if (socials && !Array.isArray(socials)) {
      return NextResponse.json(
        { error: "invalid_socials", message: "socials must be an array." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const userId = auth.key.userId;

    // Validate slug
    const slugStr = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);
    const slugTaken = await sql`SELECT id FROM users WHERE slug = ${slugStr} AND id != ${userId}`;
    if (slugTaken.length > 0) {
      return NextResponse.json(
        { error: "slug_taken", message: "This username/slug is already taken." },
        { status: 400 }
      );
    }

    // Check tier for service limits
    const tierRows = await sql`SELECT subscription_tier FROM users WHERE id = ${userId}`;
    const tier = tierRows[0]?.subscription_tier || "free";
    const maxServices = tier === "free" ? 3 : 999;
    const serviceList = (services || []).slice(0, maxServices);

    // 1. Create/update profile
    await sql`
      UPDATE users SET
        full_name = ${name},
        slug = ${slugStr},
        bio = ${bio || null},
        category = ${category || null},
        link_bio_template = 'minimal',
        visible_in_marketplace = TRUE,
        onboarding_complete = TRUE,
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    // 2. Create services
    const createdServices = [];
    for (const svc of serviceList) {
      if (!svc.title || svc.price === undefined) continue;
      const result = await sql`
        INSERT INTO services (user_id, title, description, price, currency, delivery_days, category)
        VALUES (
          ${userId},
          ${svc.title},
          ${svc.description || ""},
          ${Math.max(0, Number(svc.price))},
          ${svc.currency || "USD"},
          ${Number(svc.delivery_days) || 7},
          ${svc.category || category || null}
        )
        RETURNING id, title, description, price, currency, delivery_days, category, is_active, created_at
      `;
      createdServices.push(result[0]);
    }

    // 3. Create socials
    const createdSocials = [];
    if (socials && socials.length > 0) {
      for (const social of socials.slice(0, 15)) {
        if (!social.platform || !social.url) continue;
        const result = await sql`
          INSERT INTO social_connections (user_id, platform, handle, url)
          VALUES (
            ${userId},
            ${social.platform},
            ${social.username || social.handle || social.platform},
            ${social.url}
          )
          RETURNING id, platform, handle, url
        `;
        createdSocials.push(result[0]);
      }
    }

    logAgentActivity(auth.key.keyId, userId, "quickstart_completed", {
      services_count: createdServices.length,
      socials_count: createdSocials.length,
    });

    const publicUrl = `https://hireacreator.ai/${slugStr}`;

    return NextResponse.json({
      success: true,
      profile: {
        id: userId,
        name,
        slug: slugStr,
        bio: bio || null,
        category: category || null,
        public_url: publicUrl,
      },
      services: createdServices,
      socials: createdSocials,
      next_steps: [
        `Your profile is live at ${publicUrl}`,
        "Clients and agents can now find and book your services.",
        "Use GET /api/agent/earnings to track revenue.",
        "Use GET /api/agent/earnings/withdraw to request payouts (requires Stripe Connect).",
      ],
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Agent Quickstart Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Quickstart failed." },
      { status: 500 }
    );
  }
}
