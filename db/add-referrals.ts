import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  // Referral code on users
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_earnings_cents INT DEFAULT 0`;

  // Referrals tracking table
  await sql`
    CREATE TABLE IF NOT EXISTS referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id UUID NOT NULL REFERENCES users(id),
      referred_id UUID NOT NULL REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'signed_up',
      tier VARCHAR(20) DEFAULT 'free',
      commission_percent INT DEFAULT 20,
      total_earned_cents INT DEFAULT 0,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(referrer_id, referred_id)
    )
  `;

  // Commission payouts log
  await sql`
    CREATE TABLE IF NOT EXISTS referral_commissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      referral_id UUID NOT NULL REFERENCES referrals(id),
      referrer_id UUID NOT NULL REFERENCES users(id),
      amount_cents INT NOT NULL,
      source_event VARCHAR(50),
      stripe_invoice_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Generate referral codes for existing users who don't have one
  const users = await sql`SELECT id, slug FROM users WHERE referral_code IS NULL`;
  for (const u of users) {
    const code = (u.slug as string)?.split("-")[0] || Math.random().toString(36).slice(2, 8);
    try {
      await sql`UPDATE users SET referral_code = ${code} WHERE id = ${u.id}`;
    } catch {
      // If collision, use random
      const rand = Math.random().toString(36).slice(2, 10);
      await sql`UPDATE users SET referral_code = ${rand} WHERE id = ${u.id}`;
    }
  }

  console.log("Referral system tables created, codes generated");
}

run().catch(console.error);
