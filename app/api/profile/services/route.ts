import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { calculateAndSaveScore } from "@/lib/creator-score";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.subscription_tier FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const services = await sql`SELECT * FROM services WHERE user_id = ${user.id} ORDER BY created_at`;
  const packages = await sql`
    SELECT sp.* FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    WHERE s.user_id = ${user.id}
    ORDER BY sp.service_id, CASE sp.tier WHEN 'basic' THEN 0 WHEN 'standard' THEN 1 WHEN 'premium' THEN 2 END
  `;

  // Group packages by service_id
  const servicesWithPackages = services.map((s: any) => ({
    ...s,
    packages: packages.filter((p: any) => p.service_id === s.id),
  }));

  return NextResponse.json({ services: servicesWithPackages });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { title, description, price, delivery_days, category } = body;

  if (!title || price === undefined) {
    return NextResponse.json({ error: "missing_fields", message: "Title and price are required." }, { status: 400 });
  }

  const sql = getDb();

  // Free = max 3, Pro+ = unlimited
  const tier = user.subscription_tier || "free";
  if (tier === "free") {
    const count = await sql`SELECT COUNT(*)::int AS cnt FROM services WHERE user_id = ${user.id}`;
    if ((count[0]?.cnt || 0) >= 3) {
      return NextResponse.json({ error: "max_services", message: "Free accounts can list up to 3 services. Upgrade to Pro for unlimited." }, { status: 400 });
    }
  }

  const result = await sql`
    INSERT INTO services (user_id, title, description, price, delivery_days, category)
    VALUES (${user.id}, ${title}, ${description || ""}, ${Math.max(0, Number(price))}, ${Number(delivery_days) || 7}, ${category || null})
    RETURNING id
  `;

  // Fire-and-forget score recalculation
  calculateAndSaveScore(user.id).catch((err) =>
    console.error("[API /profile/services POST] Score recalc failed:", err)
  );

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, title, description, price, delivery_days, category, is_active } = body;

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`
    UPDATE services SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      price = COALESCE(${price !== undefined ? Math.max(0, Number(price)) : null}, price),
      delivery_days = COALESCE(${delivery_days ? Number(delivery_days) : null}, delivery_days),
      category = COALESCE(${category ?? null}, category),
      is_active = COALESCE(${is_active ?? null}, is_active),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM services WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ success: true });
}
