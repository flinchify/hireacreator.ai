import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS marketplace_eligible BOOLEAN DEFAULT false`;
  console.log("Onboarding columns added");
}
run().catch(console.error);
