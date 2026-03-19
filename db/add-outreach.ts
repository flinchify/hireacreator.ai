import { getDb } from "../lib/db";

async function migrate() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS outreach_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      business_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT NOT NULL,
      industry TEXT,
      website TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_email ON outreach_contacts(email)`;
  console.log("OK: outreach_contacts");

  await sql`
    CREATE TABLE IF NOT EXISTS outreach_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body_html TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("OK: outreach_templates");

  await sql`
    CREATE TABLE IF NOT EXISTS outreach_sends (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contact_id UUID REFERENCES outreach_contacts(id),
      template_id UUID REFERENCES outreach_templates(id),
      status TEXT DEFAULT 'sent',
      opened_at TIMESTAMPTZ,
      clicked_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_outreach_sends_contact ON outreach_sends(contact_id)`;
  console.log("OK: outreach_sends");

  // Seed default template
  const existing = await sql`SELECT id FROM outreach_templates LIMIT 1`;
  if (existing.length === 0) {
    await sql`
      INSERT INTO outreach_templates (name, subject, body_html) VALUES (
        'Default Invite',
        '{business_name}, your competitors are using creator content',
        ${`<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <img src="https://hireacreator.ai/logo-512.png" alt="HireACreator" style="width: 40px; height: 40px; margin-bottom: 24px;" />

  <h1 style="font-size: 24px; color: #171717; margin-bottom: 16px;">Hi {contact_name},</h1>

  <p style="font-size: 16px; color: #525252; line-height: 1.6;">
    Brands in {industry} are shifting to creator-made content because it converts 29% better than traditional ads — and costs a fraction of agency work.
  </p>

  <p style="font-size: 16px; color: #525252; line-height: 1.6;">
    <strong>HireACreator</strong> lets you find, brief, and pay verified creators in minutes. No DM outreach. No invoicing headaches. No agency fees.
  </p>

  <p style="font-size: 16px; color: #525252; line-height: 1.6;">
    {custom_message}
  </p>

  <a href="https://hireacreator.ai/for-brands?ref=outreach" style="display: inline-block; background: #171717; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 24px 0;">
    Browse Creators →
  </a>

  <p style="font-size: 14px; color: #a3a3a3; margin-top: 32px;">
    0% creator commission · Stripe-secured payments · API + MCP ready
  </p>

  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

  <p style="font-size: 12px; color: #a3a3a3;">
    HireACreator.ai · The creator marketplace for humans and AI agents<br>
    <a href="https://hireacreator.ai/privacy" style="color: #a3a3a3;">Privacy</a> ·
    <a href="{unsubscribe_url}" style="color: #a3a3a3;">Unsubscribe</a>
  </p>
</div>`}
      )
    `;
    console.log("OK: seeded default template");
  }

  console.log("Done: outreach migration complete");
}

migrate().catch(console.error);
