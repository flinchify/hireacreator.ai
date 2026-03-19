import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { Resend } from "resend";

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

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// POST — send outreach emails
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { contactIds, templateId, customMessage } = body;

  if (!templateId) return NextResponse.json({ error: "missing_template" }, { status: 400 });

  const sql = getDb();

  // Get template
  const templates = await sql`SELECT * FROM outreach_templates WHERE id = ${templateId}`;
  if (templates.length === 0) return NextResponse.json({ error: "template_not_found" }, { status: 404 });
  const template = templates[0];

  // Get contacts
  let contacts;
  if (contactIds === "all_pending") {
    contacts = await sql`SELECT * FROM outreach_contacts WHERE status = 'pending'`;
  } else if (Array.isArray(contactIds) && contactIds.length > 0) {
    contacts = await sql`SELECT * FROM outreach_contacts WHERE id = ANY(${contactIds})`;
  } else {
    return NextResponse.json({ error: "no_contacts" }, { status: 400 });
  }

  if (contacts.length === 0) return NextResponse.json({ error: "no_contacts_found" }, { status: 400 });

  // Init Resend
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "resend_not_configured" }, { status: 500 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM || "HireACreator <noreply@hireacreator.ai>";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai";

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    // Create send record first to get ID for tracking
    const sendRows = await sql`
      INSERT INTO outreach_sends (contact_id, template_id, status)
      VALUES (${contact.id}, ${templateId}, 'sending')
      RETURNING id
    `;
    const sendId = sendRows[0].id;

    // Replace template variables
    const subject = (template.subject as string)
      .replace(/\{business_name\}/g, contact.business_name || "")
      .replace(/\{contact_name\}/g, contact.contact_name || "there")
      .replace(/\{industry\}/g, contact.industry || "your industry");

    const trackOpenUrl = `${baseUrl}/api/admin/outreach/track?id=${sendId}&type=open`;
    const ctaUrl = `${baseUrl}/api/admin/outreach/track?id=${sendId}&type=click&url=${encodeURIComponent("https://hireacreator.ai/for-brands?ref=outreach")}`;
    const unsubscribeUrl = `${baseUrl}/api/admin/outreach/track?id=${sendId}&type=click&url=${encodeURIComponent(`${baseUrl}/unsubscribe`)}`;

    let html = (template.body_html as string)
      .replace(/\{business_name\}/g, escapeHtml(contact.business_name || ""))
      .replace(/\{contact_name\}/g, escapeHtml(contact.contact_name || "there"))
      .replace(/\{industry\}/g, escapeHtml(contact.industry || "your industry"))
      .replace(/\{custom_message\}/g, customMessage ? escapeHtml(customMessage) : "")
      .replace(/\{unsubscribe_url\}/g, unsubscribeUrl);

    // Replace CTA link with tracked version
    html = html.replace(
      /href="https:\/\/hireacreator\.ai\/for-brands\?ref=outreach"/g,
      `href="${ctaUrl}"`
    );

    // Add tracking pixel
    html += `<img src="${trackOpenUrl}" width="1" height="1" style="display:none;" alt="" />`;

    try {
      await resend.emails.send({
        from,
        to: contact.email as string,
        subject,
        html,
      });

      await sql`UPDATE outreach_sends SET status = 'sent', sent_at = NOW() WHERE id = ${sendId}`;
      await sql`UPDATE outreach_contacts SET status = 'sent' WHERE id = ${contact.id}`;
      sent++;
    } catch (err) {
      await sql`UPDATE outreach_sends SET status = 'failed' WHERE id = ${sendId}`;
      failed++;
    }

    // Rate limit: 2 per second
    if (i < contacts.length - 1) {
      await sleep(500);
    }
  }

  return NextResponse.json({ sent, failed, total: contacts.length });
}
