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

const DEFAULT_TEMPLATES = [
  {
    title: "Thanks for your enquiry",
    content: "Hi {name},\n\nThanks so much for reaching out! I'd love to learn more about your project.\n\nMy rate for {service} starts at my listed price, and I can typically turn things around within a week. Want to hop on a quick call to discuss the details?",
    category: "intro",
  },
  {
    title: "I'm currently booked",
    content: "Hi {name},\n\nThanks for your interest! Unfortunately, I'm fully booked at the moment. I should have availability again in a couple of weeks.\n\nWould you like me to reach out when I'm free, or would you prefer to check back later?",
    category: "availability",
  },
  {
    title: "Here's my process",
    content: "Hi {name},\n\nGreat to hear from you! Here's how I typically work:\n\n1. Discovery call to understand your goals\n2. I'll send a proposal with timeline and pricing\n3. 50% deposit to get started\n4. Revisions included until you're happy\n5. Final delivery + remaining balance\n\nShall we set up a call?",
    category: "intro",
  },
  {
    title: "Not the right fit",
    content: "Hi {name},\n\nThanks so much for thinking of me! After reviewing your brief, I don't think I'm the best fit for this particular project. I want to make sure you get the best result possible.\n\nI'd recommend checking out some other creators on HireACreator who specialise in this area. Wishing you all the best with the project!",
    category: "decline",
  },
];

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  let templates = await sql`
    SELECT * FROM reply_templates WHERE user_id = ${user.id} ORDER BY use_count DESC, created_at DESC
  `;

  // Seed defaults if user has none
  if (templates.length === 0) {
    for (const t of DEFAULT_TEMPLATES) {
      await sql`
        INSERT INTO reply_templates (user_id, title, content, category)
        VALUES (${user.id}, ${t.title}, ${t.content}, ${t.category})
      `;
    }
    templates = await sql`
      SELECT * FROM reply_templates WHERE user_id = ${user.id} ORDER BY use_count DESC, created_at DESC
    `;
  }

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: "title and content required" }, { status: 400 });
  }

  const sql = getDb();
  const rows = await sql`
    INSERT INTO reply_templates (user_id, title, content, category)
    VALUES (${user.id}, ${body.title.trim()}, ${body.content.trim()}, ${body.category || null})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sql = getDb();

  // Increment use_count if requested
  if (body.increment_use) {
    await sql`UPDATE reply_templates SET use_count = use_count + 1 WHERE id = ${body.id} AND user_id = ${user.id}`;
    return NextResponse.json({ success: true });
  }

  await sql`
    UPDATE reply_templates SET
      title = COALESCE(${body.title ?? null}, title),
      content = COALESCE(${body.content ?? null}, content),
      category = COALESCE(${body.category ?? null}, category)
    WHERE id = ${body.id} AND user_id = ${user.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sql = getDb();
  await sql`DELETE FROM reply_templates WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ success: true });
}
