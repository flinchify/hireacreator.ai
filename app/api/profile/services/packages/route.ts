import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  const sql = getDb();

  if (serviceId) {
    // Verify ownership
    const svc = await sql`SELECT id FROM services WHERE id = ${serviceId} AND user_id = ${user.id}`;
    if (svc.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const packages = await sql`
      SELECT * FROM service_packages WHERE service_id = ${serviceId}
      ORDER BY CASE tier WHEN 'basic' THEN 0 WHEN 'standard' THEN 1 WHEN 'premium' THEN 2 END
    `;
    return NextResponse.json({ packages });
  }

  // Return all packages for all user services
  const packages = await sql`
    SELECT sp.* FROM service_packages sp
    JOIN services s ON s.id = sp.service_id
    WHERE s.user_id = ${user.id}
    ORDER BY sp.service_id, CASE sp.tier WHEN 'basic' THEN 0 WHEN 'standard' THEN 1 WHEN 'premium' THEN 2 END
  `;
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { serviceId, packages } = body;

  if (!serviceId || !Array.isArray(packages)) {
    return NextResponse.json({ error: "missing_fields", message: "serviceId and packages array required." }, { status: 400 });
  }

  const sql = getDb();

  // Verify ownership
  const svc = await sql`SELECT id FROM services WHERE id = ${serviceId} AND user_id = ${user.id}`;
  if (svc.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Validate tiers
  const validTiers = ["basic", "standard", "premium"];
  for (const pkg of packages) {
    if (!validTiers.includes(pkg.tier)) {
      return NextResponse.json({ error: "invalid_tier", message: `Invalid tier: ${pkg.tier}` }, { status: 400 });
    }
    if (!pkg.title || pkg.price === undefined) {
      return NextResponse.json({ error: "missing_fields", message: "Each package needs title and price." }, { status: 400 });
    }
  }

  // Delete existing packages for this service, then insert new ones
  await sql`DELETE FROM service_packages WHERE service_id = ${serviceId}`;

  const results = [];
  for (const pkg of packages) {
    const features = Array.isArray(pkg.features) ? JSON.stringify(pkg.features) : "[]";
    const rows = await sql`
      INSERT INTO service_packages (service_id, tier, title, price, delivery_days, revisions, features)
      VALUES (${serviceId}, ${pkg.tier}, ${pkg.title}, ${Math.max(0, Number(pkg.price))}, ${Number(pkg.deliveryDays) || 7}, ${Number(pkg.revisions) || 1}, ${features}::jsonb)
      RETURNING id
    `;
    results.push({ id: rows[0].id, tier: pkg.tier });
  }

  return NextResponse.json({ success: true, packages: results }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  if (!serviceId) return NextResponse.json({ error: "missing_service_id" }, { status: 400 });

  const sql = getDb();

  // Verify ownership
  const svc = await sql`SELECT id FROM services WHERE id = ${serviceId} AND user_id = ${user.id}`;
  if (svc.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await sql`DELETE FROM service_packages WHERE service_id = ${serviceId}`;
  return NextResponse.json({ success: true });
}
