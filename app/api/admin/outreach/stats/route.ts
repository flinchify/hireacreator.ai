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

export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const sql = getDb();

    const contactCount = await sql`SELECT COUNT(*)::int AS cnt FROM outreach_contacts`;
    const sentCount = await sql`SELECT COUNT(*)::int AS cnt FROM outreach_sends WHERE status = 'sent'`;
    const openedCount = await sql`SELECT COUNT(*)::int AS cnt FROM outreach_sends WHERE opened_at IS NOT NULL`;
    const clickedCount = await sql`SELECT COUNT(*)::int AS cnt FROM outreach_sends WHERE clicked_at IS NOT NULL`;

    const totalContacts = contactCount[0]?.cnt || 0;
    const totalSent = sentCount[0]?.cnt || 0;
    const totalOpened = openedCount[0]?.cnt || 0;
    const totalClicked = clickedCount[0]?.cnt || 0;

    const recentSends = await sql`
      SELECT s.*, c.business_name, c.email AS contact_email, t.name AS template_name
      FROM outreach_sends s
      JOIN outreach_contacts c ON c.id = s.contact_id
      JOIN outreach_templates t ON t.id = s.template_id
      ORDER BY s.sent_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      totalContacts,
      totalSent,
      totalOpened,
      totalClicked,
      openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
      clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
      recentSends,
    });
  } catch (e) {
    console.error('[OutreachStats]', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
