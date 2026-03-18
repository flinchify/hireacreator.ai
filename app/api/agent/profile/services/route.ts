import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "read");
    if (!auth.ok) return auth.response;

    const sql = getDb();
    const services = await sql`
      SELECT id, title, description, price, currency, delivery_days, category, is_active, created_at, updated_at
      FROM services WHERE user_id = ${auth.key.userId}
      ORDER BY created_at
    `;

    return NextResponse.json({ services });
  } catch (err: any) {
    console.error("[Agent Services GET Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch services." },
      { status: 500 }
    );
  }
}

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

    const { title, description, price, currency, delivery_days, category } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        { error: "missing_fields", message: "title and price are required." },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "invalid_price", message: "price must be a non-negative number (in cents)." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check tier-based limits (free = max 3)
    const tierRows = await sql`SELECT subscription_tier FROM users WHERE id = ${auth.key.userId}`;
    const tier = tierRows[0]?.subscription_tier || "free";
    if (tier === "free") {
      const count = await sql`SELECT COUNT(*)::int AS cnt FROM services WHERE user_id = ${auth.key.userId}`;
      if ((count[0]?.cnt || 0) >= 3) {
        return NextResponse.json(
          { error: "max_services", message: "Free accounts can list up to 3 services. Upgrade to Pro for unlimited." },
          { status: 400 }
        );
      }
    }

    const result = await sql`
      INSERT INTO services (user_id, title, description, price, currency, delivery_days, category)
      VALUES (
        ${auth.key.userId},
        ${title},
        ${description || ""},
        ${Math.max(0, Number(price))},
        ${currency || "USD"},
        ${Number(delivery_days) || 7},
        ${category || null}
      )
      RETURNING id, title, description, price, currency, delivery_days, category, is_active, created_at
    `;

    return NextResponse.json({
      success: true,
      service: result[0],
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Agent Services POST Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to create service." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
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

    const { serviceId, title, description, price, currency, delivery_days, category, is_active } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "missing_fields", message: "serviceId is required." },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      UPDATE services SET
        title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        price = COALESCE(${price !== undefined ? Math.max(0, Number(price)) : null}, price),
        currency = COALESCE(${currency ?? null}, currency),
        delivery_days = COALESCE(${delivery_days ? Number(delivery_days) : null}, delivery_days),
        category = COALESCE(${category ?? null}, category),
        is_active = COALESCE(${is_active ?? null}, is_active),
        updated_at = NOW()
      WHERE id = ${serviceId} AND user_id = ${auth.key.userId}
    `;

    const updated = await sql`
      SELECT id, title, description, price, currency, delivery_days, category, is_active, updated_at
      FROM services WHERE id = ${serviceId} AND user_id = ${auth.key.userId}
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "service_not_found", message: "Service not found or does not belong to you." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service: updated[0],
    });
  } catch (err: any) {
    console.error("[Agent Services PATCH Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to update service." },
      { status: 500 }
    );
  }
}
