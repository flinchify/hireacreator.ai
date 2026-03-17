import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAdmin() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW() AND u.role = 'admin'
  `;
  return rows.length > 0 ? rows[0] : null;
}

// GET /api/admin/conversations/[id] — view full conversation (admin only)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();

    const conv = await sql`
      SELECT c.*,
        a.full_name as name_a, a.email as email_a, a.avatar_url as avatar_a, a.role as role_a,
        b.full_name as name_b, b.email as email_b, b.avatar_url as avatar_b, b.role as role_b
      FROM conversations c
      JOIN users a ON a.id = c.participant_a
      JOIN users b ON b.id = c.participant_b
      WHERE c.id = ${params.id}
    `;
    if (conv.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const messages = await sql`
      SELECT m.*, u.full_name as sender_name, u.email as sender_email
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = ${params.id}
      ORDER BY m.created_at ASC
    `;

    const reports = await sql`
      SELECT r.*, reporter.full_name as reporter_name
      FROM message_reports r
      JOIN users reporter ON reporter.id = r.reporter_id
      JOIN messages m ON m.id = r.message_id
      WHERE m.conversation_id = ${params.id}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ conversation: conv[0], messages, reports });
  } catch (e: any) {
    console.error("Admin conversation error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
