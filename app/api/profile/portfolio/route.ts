import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? (rows[0] as { id: string }) : null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const items = await sql`
    SELECT * FROM portfolio_items WHERE user_id = ${user.id} ORDER BY sort_order ASC
  `;
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, image_url, video_url, link_url } = body as {
    title?: string;
    description?: string;
    image_url?: string;
    video_url?: string;
    link_url?: string;
  };

  if (!title || !image_url) {
    return NextResponse.json({ error: "title and image_url are required" }, { status: 400 });
  }

  const sql = getDb();
  const result = await sql`
    INSERT INTO portfolio_items (user_id, title, description, image_url, video_url, link_url, sort_order)
    VALUES (
      ${user.id},
      ${title},
      ${description || null},
      ${image_url},
      ${video_url || null},
      ${link_url || null},
      COALESCE((SELECT MAX(sort_order) + 1 FROM portfolio_items WHERE user_id = ${user.id}), 0)
    )
    RETURNING *
  `;

  return NextResponse.json({ item: result[0] });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = body as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const sql = getDb();
  await sql`DELETE FROM portfolio_items WHERE id = ${id} AND user_id = ${user.id}`;

  return NextResponse.json({ success: true });
}
