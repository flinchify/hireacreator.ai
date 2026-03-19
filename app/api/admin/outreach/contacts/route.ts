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

// GET — list contacts with optional filters
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const industry = searchParams.get("industry");

  const sql = getDb();

  let contacts;
  if (status && industry) {
    contacts = await sql`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM outreach_sends s WHERE s.contact_id = c.id) AS send_count,
        (SELECT MAX(s.sent_at) FROM outreach_sends s WHERE s.contact_id = c.id) AS last_sent
      FROM outreach_contacts c
      WHERE c.status = ${status} AND c.industry ILIKE ${`%${industry}%`}
      ORDER BY c.created_at DESC
    `;
  } else if (status) {
    contacts = await sql`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM outreach_sends s WHERE s.contact_id = c.id) AS send_count,
        (SELECT MAX(s.sent_at) FROM outreach_sends s WHERE s.contact_id = c.id) AS last_sent
      FROM outreach_contacts c
      WHERE c.status = ${status}
      ORDER BY c.created_at DESC
    `;
  } else if (industry) {
    contacts = await sql`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM outreach_sends s WHERE s.contact_id = c.id) AS send_count,
        (SELECT MAX(s.sent_at) FROM outreach_sends s WHERE s.contact_id = c.id) AS last_sent
      FROM outreach_contacts c
      WHERE c.industry ILIKE ${`%${industry}%`}
      ORDER BY c.created_at DESC
    `;
  } else {
    contacts = await sql`
      SELECT c.*,
        (SELECT COUNT(*)::int FROM outreach_sends s WHERE s.contact_id = c.id) AS send_count,
        (SELECT MAX(s.sent_at) FROM outreach_sends s WHERE s.contact_id = c.id) AS last_sent
      FROM outreach_contacts c
      ORDER BY c.created_at DESC
    `;
  }

  return NextResponse.json({ contacts });
}

// POST — add contacts (single, bulk array, or CSV)
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const sql = getDb();

  let contactsList: { businessName: string; contactName?: string; email: string; industry?: string; website?: string }[] = [];

  if (body.csvData) {
    const lines = (body.csvData as string).split("\n").filter(l => l.trim());
    const header = lines[0].toLowerCase().split(",").map(h => h.trim());
    const nameIdx = header.findIndex(h => h.includes("business") || h === "name" || h === "company");
    const contactIdx = header.findIndex(h => h.includes("contact") || h === "person");
    const emailIdx = header.findIndex(h => h.includes("email"));
    const industryIdx = header.findIndex(h => h.includes("industry") || h === "category");
    const websiteIdx = header.findIndex(h => h.includes("website") || h === "url");

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      const email = cols[emailIdx >= 0 ? emailIdx : 1];
      if (!email || !email.includes("@")) continue;
      contactsList.push({
        businessName: cols[nameIdx >= 0 ? nameIdx : 0] || "",
        contactName: contactIdx >= 0 ? cols[contactIdx] : undefined,
        email,
        industry: industryIdx >= 0 ? cols[industryIdx] : undefined,
        website: websiteIdx >= 0 ? cols[websiteIdx] : undefined,
      });
    }
  } else if (body.contacts && Array.isArray(body.contacts)) {
    contactsList = body.contacts;
  } else if (body.businessName && body.email) {
    contactsList = [body];
  }

  if (contactsList.length === 0) {
    return NextResponse.json({ error: "no_contacts" }, { status: 400 });
  }

  let added = 0;
  let skipped = 0;

  for (const c of contactsList) {
    const exists = await sql`SELECT id FROM outreach_contacts WHERE email = ${c.email} LIMIT 1`;
    if (exists.length > 0) {
      skipped++;
      continue;
    }
    await sql`
      INSERT INTO outreach_contacts (business_name, contact_name, email, industry, website)
      VALUES (${c.businessName || ""}, ${c.contactName || null}, ${c.email}, ${c.industry || null}, ${c.website || null})
    `;
    added++;
  }

  return NextResponse.json({ added, skipped, total: contactsList.length });
}
