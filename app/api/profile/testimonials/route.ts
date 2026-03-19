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

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const testimonials = await sql`
    SELECT * FROM testimonials WHERE user_id = ${user.id}
    ORDER BY display_order ASC, created_at DESC
  `;

  return NextResponse.json({ testimonials });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { clientName, clientCompany, content, rating, source, screenshotUrl } = body;

  if (!clientName || !content) {
    return NextResponse.json({ error: "missing_fields", message: "Client name and testimonial content are required." }, { status: 400 });
  }

  if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
    return NextResponse.json({ error: "invalid_rating", message: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const sql = getDb();

  const rows = await sql`
    INSERT INTO testimonials (user_id, client_name, client_company, content, rating, source, screenshot_url)
    VALUES (${user.id}, ${clientName}, ${clientCompany || null}, ${content}, ${rating || null}, ${source || 'manual'}, ${screenshotUrl || null})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, displayOrder, isVisible, clientName, clientCompany, content, rating, source, screenshotUrl } = body;

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`
    UPDATE testimonials SET
      client_name = COALESCE(${clientName ?? null}, client_name),
      client_company = ${clientCompany !== undefined ? clientCompany : null},
      content = COALESCE(${content ?? null}, content),
      rating = COALESCE(${rating ?? null}, rating),
      source = COALESCE(${source ?? null}, source),
      screenshot_url = ${screenshotUrl !== undefined ? screenshotUrl : null},
      display_order = COALESCE(${displayOrder ?? null}, display_order),
      is_visible = COALESCE(${isVisible ?? null}, is_visible)
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
  await sql`DELETE FROM testimonials WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ success: true });
}
