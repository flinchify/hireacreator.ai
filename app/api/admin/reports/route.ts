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

// GET /api/admin/reports — list reported messages (admin only)
export async function GET(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const sql = getDb();
    const reports = await sql`
      SELECT r.*,
        m.content as message_content, m.sender_id, m.conversation_id, m.created_at as message_date,
        reporter.full_name as reporter_name, reporter.email as reporter_email,
        sender.full_name as sender_name, sender.email as sender_email
      FROM message_reports r
      JOIN messages m ON m.id = r.message_id
      JOIN users reporter ON reporter.id = r.reporter_id
      JOIN users sender ON sender.id = m.sender_id
      WHERE r.status = ${status}
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({ reports });
  } catch (e: any) {
    console.error("Admin reports error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PATCH /api/admin/reports — resolve a report
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { reportId, action, notes } = body;

    if (!reportId || !action) return NextResponse.json({ error: "missing_fields" }, { status: 400 });

    const sql = getDb();

    if (action === "dismiss") {
      await sql`UPDATE message_reports SET status = 'dismissed', admin_notes = ${notes || null}, resolved_at = NOW() WHERE id = ${reportId}`;
    } else if (action === "warn") {
      await sql`UPDATE message_reports SET status = 'warned', admin_notes = ${notes || null}, resolved_at = NOW() WHERE id = ${reportId}`;
    } else if (action === "ban") {
      // Ban the message sender
      const report = await sql`
        SELECT m.sender_id FROM message_reports r
        JOIN messages m ON m.id = r.message_id
        WHERE r.id = ${reportId}
      `;
      if (report.length > 0) {
        await sql`UPDATE users SET is_banned = true WHERE id = ${report[0].sender_id}`;
      }
      await sql`UPDATE message_reports SET status = 'banned', admin_notes = ${notes || null}, resolved_at = NOW() WHERE id = ${reportId}`;
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Admin reports PATCH error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
