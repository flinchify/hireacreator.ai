import { getDb } from "@/lib/db";

async function main() {
  const sql = getDb();

  console.log("Creating verification_codes table...");
  await sql`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      platform TEXT NOT NULL,
      handle TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
      verified_at TIMESTAMPTZ
    )
  `;

  console.log("Adding index on user_id + platform...");
  await sql`
    CREATE INDEX IF NOT EXISTS idx_verification_codes_user_platform
    ON verification_codes(user_id, platform)
  `;

  console.log("Done! verification_codes table created.");
}

main().catch(console.error);
