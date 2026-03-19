import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET — list all templates
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sql = getDb();
  const templates = await sql`SELECT * FROM outreach_templates ORDER BY created_at DESC`;
  return NextResponse.json({ templates });
}

// POST — create a template
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { name, subject, bodyHtml } = body;

  if (!name || !subject || !bodyHtml) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    INSERT INTO outreach_templates (name, subject, body_html)
    VALUES (${name}, ${subject}, ${bodyHtml})
    RETURNING *
  `;

  return NextResponse.json({ template: rows[0] });
}

// PATCH — update a template
export async function PATCH(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { id, name, subject, bodyHtml } = body;

  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`
    UPDATE outreach_templates
    SET name = COALESCE(${name || null}, name),
        subject = COALESCE(${subject || null}, subject),
        body_html = COALESCE(${bodyHtml || null}, body_html),
        updated_at = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

// DELETE — remove a template
export async function DELETE(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM outreach_templates WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
