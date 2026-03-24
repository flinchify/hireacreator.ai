import { getDb } from "../lib/db";

async function addSocialToggles() {
  const sql = getDb();

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS social_offers_enabled BOOLEAN DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS social_outreach_enabled BOOLEAN DEFAULT TRUE`;

  console.log("Social toggle columns added successfully");
}

addSocialToggles().catch(console.error);
