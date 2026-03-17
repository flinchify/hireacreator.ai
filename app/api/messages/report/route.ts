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

// POST /api/messages/report — report a message
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { messageId, reason } = body;

    if (!messageId || !reason?.trim()) {
      return NextResponse.json({ error: "missing_fields", message: "Message ID and reason required." }, { status: 400 });
    }

    const sql = getDb();

    // Verify message exists and user is in the conversation
    const msg = await sql`
      SELECT m.id, m.conversation_id, m.sender_id FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.id = ${messageId}
        AND (c.participant_a = ${user.id} OR c.participant_b = ${user.id})
        AND m.sender_id != ${user.id}
    `;
    if (msg.length === 0) return NextResponse.json({ error: "not_found", message: "Message not found or you cannot report your own messages." }, { status: 404 });

    // Check for duplicate report
    const existing = await sql`SELECT id FROM message_reports WHERE message_id = ${messageId} AND reporter_id = ${user.id}`;
    if (existing.length > 0) return NextResponse.json({ error: "already_reported", message: "You have already reported this message." }, { status: 400 });

    // Create report and flag the message
    await sql`
      INSERT INTO message_reports (message_id, reporter_id, reason)
      VALUES (${messageId}, ${user.id}, ${reason.trim().slice(0, 500)})
    `;
    await sql`UPDATE messages SET is_flagged = true, flag_reason = 'User reported' WHERE id = ${messageId}`;

    return NextResponse.json({ success: true, message: "Report submitted. Our team will review this message." });
  } catch (e: any) {
    console.error("Report error:", e);
    return NextResponse.json({ error: "server_error", message: e.message }, { status: 500 });
  }
}
