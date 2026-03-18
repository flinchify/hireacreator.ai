import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const products = await sql`
    SELECT * FROM creator_products WHERE user_id = ${user.id} ORDER BY sort_order ASC, created_at DESC
  `;

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, price_cents, currency, product_url, thumbnail_url, product_type } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    INSERT INTO creator_products (user_id, title, description, price_cents, currency, product_url, thumbnail_url, product_type)
    VALUES (${user.id}, ${title.trim()}, ${description || null}, ${price_cents || 0}, ${currency || "AUD"}, ${product_url || null}, ${thumbnail_url || null}, ${product_type || "digital"})
    RETURNING *
  `;

  return NextResponse.json({ product: rows[0] }, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, description, price_cents, currency, product_url, thumbnail_url, product_type, is_active, sort_order } = body;

  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  const sql = getDb();
  const existing = await sql`SELECT * FROM creator_products WHERE id = ${id} AND user_id = ${user.id}`;
  if (existing.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await sql`
    UPDATE creator_products SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      price_cents = COALESCE(${price_cents ?? null}, price_cents),
      currency = COALESCE(${currency ?? null}, currency),
      product_url = COALESCE(${product_url ?? null}, product_url),
      thumbnail_url = COALESCE(${thumbnail_url ?? null}, thumbnail_url),
      product_type = COALESCE(${product_type ?? null}, product_type),
      is_active = COALESCE(${is_active ?? null}, is_active),
      sort_order = COALESCE(${sort_order ?? null}, sort_order),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM creator_products WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ ok: true });
}
