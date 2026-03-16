import { neon } from "@neondatabase/serverless";

async function update() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Adding new columns...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(255)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS business_url TEXT`;
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image'`;
  console.log("Columns added");

  console.log("Removing mock data...");
  await sql`DELETE FROM portfolio_items WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')`;
  await sql`DELETE FROM services WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')`;
  await sql`DELETE FROM social_connections WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')`;
  await sql`DELETE FROM users WHERE email LIKE '%@example.com'`;
  console.log("Mock data removed");
}

update().catch(console.error);
