import { getDb } from "@/lib/db";

async function main() {
  const sql = getDb();

  console.log("Adding link-in-bio verification columns to users table...");

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_platform TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT FALSE`;

  console.log("Done! Link verification columns added.");
}

main().catch(console.error);
