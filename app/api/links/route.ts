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

// GET /api/links — get all my links
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const sql = getDb();
    const links = await sql`SELECT * FROM bio_links WHERE user_id = ${user.id} ORDER BY is_archived ASC, position ASC, created_at ASC`;
    return NextResponse.json({ links });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/links — create a new link
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const { title, url, thumbnailUrl, icon } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!url?.trim()) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // Validate URL
    try { new URL(url); } catch { return NextResponse.json({ error: "Invalid URL format" }, { status: 400 }); }

    const sql = getDb();

    // Get next position
    const maxPos = await sql`SELECT COALESCE(MAX(position), -1) + 1 as next FROM bio_links WHERE user_id = ${user.id}`;
    const position = maxPos[0].next;

    const link = await sql`
      INSERT INTO bio_links (user_id, title, url, thumbnail_url, icon, position)
      VALUES (${user.id}, ${title.trim()}, ${url.trim()}, ${thumbnailUrl || null}, ${icon || null}, ${position})
      RETURNING *
    `;
    return NextResponse.json({ link: link[0] });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PATCH /api/links — update a link or reorder
export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const sql = getDb();

    // Reorder: body.order = [id1, id2, id3, ...]
    if (body.order && Array.isArray(body.order)) {
      for (let i = 0; i < body.order.length; i++) {
        await sql`UPDATE bio_links SET position = ${i}, updated_at = NOW() WHERE id = ${body.order[i]} AND user_id = ${user.id}`;
      }
      return NextResponse.json({ success: true });
    }

    // Update single link
    const { id, title, url, thumbnailUrl, icon, isVisible, isPinned, isArchived, scheduleStart, scheduleEnd } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    if (url) {
      try { new URL(url); } catch { return NextResponse.json({ error: "Invalid URL format" }, { status: 400 }); }
    }

    const hasThumb = thumbnailUrl !== undefined;
    const hasIcon = icon !== undefined;

    await sql`
      UPDATE bio_links SET
        title = COALESCE(${title ?? null}, title),
        url = COALESCE(${url ?? null}, url),
        thumbnail_url = CASE WHEN ${hasThumb} THEN ${thumbnailUrl || null} ELSE thumbnail_url END,
        icon = CASE WHEN ${hasIcon} THEN ${icon || null} ELSE icon END,
        is_visible = COALESCE(${isVisible ?? null}, is_visible),
        is_pinned = COALESCE(${isPinned ?? null}, is_pinned),
        is_archived = COALESCE(${isArchived ?? null}, is_archived),
        schedule_start = CASE WHEN ${scheduleStart !== undefined} THEN ${scheduleStart ?? null}::timestamptz ELSE schedule_start END,
        schedule_end = CASE WHEN ${scheduleEnd !== undefined} THEN ${scheduleEnd ?? null}::timestamptz ELSE schedule_end END,
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
    `;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/links — delete a link
export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const sql = getDb();
    await sql`DELETE FROM bio_links WHERE id = ${id} AND user_id = ${user.id}`;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
