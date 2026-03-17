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

// GET /api/messages/[conversationId] — get messages in a conversation
export async function GET(request: Request, { params }: { params: { conversationId: string } }) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();
    const convId = params.conversationId;

    // Verify user is in this conversation
    const conv = await sql`
      SELECT * FROM conversations
      WHERE id = ${convId} AND (participant_a = ${user.id} OR participant_b = ${user.id})
    `;
    if (conv.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // Get messages
    const messages = await sql`
      SELECT m.id, m.sender_id, m.content, m.is_flagged, m.read_at, m.created_at,
             u.full_name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ${convId}
      ORDER BY m.created_at ASC
      LIMIT 200
    `;

    // Mark unread messages as read
    await sql`
      UPDATE messages SET read_at = NOW()
      WHERE conversation_id = ${convId} AND sender_id != ${user.id} AND read_at IS NULL
    `;

    // Get other participant info
    const otherId = conv[0].participant_a === user.id ? conv[0].participant_b : conv[0].participant_a;
    const other = await sql`SELECT id, full_name, avatar_url, slug, role FROM users WHERE id = ${otherId}`;

    return NextResponse.json({
      messages,
      otherUser: other.length > 0 ? other[0] : null,
      conversation: conv[0],
    });
  } catch (e: any) {
    console.error("Messages conversation GET error:", e);
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}
