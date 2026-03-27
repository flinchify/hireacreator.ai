import { getDb } from "../lib/db";

async function addLinkVerification() {
  const sql = getDb();

  // Add verification columns to users table
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_platform TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT FALSE`;

  console.log("Added link verification columns to users table");
}

addLinkVerification().catch(console.error);
