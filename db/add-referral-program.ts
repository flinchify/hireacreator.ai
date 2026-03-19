import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  // Add columns to users (some may already exist from prior referral migration)
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id)`;

  // Add reward_granted and completed_at columns to existing referrals table
  await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_granted BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE referrals ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals USING btree ((referrer_id))`;

  console.log("Referral program columns added");
}

run().catch(console.error);
