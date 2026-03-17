import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { moderateMessage } from "@/lib/moderation";

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

// GET /api/messages — list conversations
export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!user.age_verified) return NextResponse.json({ error: "age_verification_required", message: "You must verify you are 18+ to use messaging." }, { status: 403 });

    const sql = getDb();
    const conversations = await sql`
      SELECT c.*,
        CASE WHEN c.participant_a = ${user.id} THEN c.participant_b ELSE c.participant_a END as other_user_id,
        u.full_name as other_name, u.avatar_url as other_avatar, u.slug as other_slug, u.role as other_role,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*)::int FROM messages WHERE conversation_id = c.id AND sender_id != ${user.id} AND read_at IS NULL) as unread_count
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.participant_a = ${user.id} THEN c.participant_b ELSE c.participant_a END
      WHERE c.participant_a = ${user.id} OR c.participant_b = ${user.id}
      ORDER BY c.last_message_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ conversations });
  } catch (e: any) {
    console.error("Messages GET error:", e);
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}

// POST /api/messages — send a message
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (!user.age_verified) return NextResponse.json({ error: "age_verification_required", message: "You must verify you are 18+ to use messaging." }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { recipientId, content } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ error: "missing_fields", message: "Recipient and message content required." }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "too_long", message: "Messages must be under 2000 characters." }, { status: 400 });
    }

    if (recipientId === user.id) {
      return NextResponse.json({ error: "self_message", message: "You cannot message yourself." }, { status: 400 });
    }

    // Check recipient exists and allows messages
    const sql = getDb();
    const recipient = await sql`SELECT id, allow_messages, role FROM users WHERE id = ${recipientId}`;
    if (recipient.length === 0) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    if (!recipient[0].allow_messages) return NextResponse.json({ error: "messages_disabled", message: "This user has disabled messages." }, { status: 403 });

    // Moderate content
    const modResult = moderateMessage(content.trim());
    if (!modResult.allowed) {
      return NextResponse.json({ error: "content_blocked", message: "Your message contains prohibited content and cannot be sent." }, { status: 400 });
    }

    // Find or create conversation (normalize order: smaller UUID first)
    const [a, b] = user.id < recipientId ? [user.id, recipientId] : [recipientId, user.id];
    
    let conv = await sql`SELECT id FROM conversations WHERE participant_a = ${a} AND participant_b = ${b}`;
    if (conv.length === 0) {
      conv = await sql`
        INSERT INTO conversations (participant_a, participant_b)
        VALUES (${a}, ${b})
        RETURNING id
      `;
    }
    const convId = conv[0].id;

    // Insert message
    const msg = await sql`
      INSERT INTO messages (conversation_id, sender_id, content, is_flagged, flag_reason)
      VALUES (${convId}, ${user.id}, ${modResult.cleanContent}, ${modResult.flagged}, ${modResult.reason || null})
      RETURNING id, content, is_flagged, created_at
    `;

    // Update conversation timestamp
    await sql`UPDATE conversations SET last_message_at = NOW() WHERE id = ${convId}`;

    return NextResponse.json({ message: msg[0], conversationId: convId });
  } catch (e: any) {
    console.error("Messages POST error:", e);
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}
