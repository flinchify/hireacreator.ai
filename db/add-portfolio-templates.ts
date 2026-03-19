import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS template_type TEXT DEFAULT 'standard'`;
  await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'`;

  console.log("Portfolio template columns added");
}

run().catch(console.error);
