import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_balance_cents INT DEFAULT 0`;
  // Rename earnings to credits in referrals context
  await sql`ALTER TABLE referral_commissions ADD COLUMN IF NOT EXISTS credited BOOLEAN DEFAULT FALSE`;
  console.log("Added credit_balance_cents + credited column");
}
run().catch(console.error);
