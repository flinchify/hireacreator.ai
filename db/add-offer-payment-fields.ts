import { getDb } from "@/lib/db";

async function addOfferPaymentFields() {
  const sql = getDb();

  console.log("Adding offer payment fields...");

  // Add new columns
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS stripe_checkout_id TEXT`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_notes TEXT`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS fee_cents INTEGER NOT NULL DEFAULT 0`;

  // Update status check constraint to include new statuses
  // Drop old constraint and add new one
  await sql`ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check`;
  await sql`ALTER TABLE offers ADD CONSTRAINT offers_status_check CHECK (status IN ('pending', 'viewed', 'accepted', 'paid', 'delivered', 'completed', 'declined', 'countered', 'expired', 'disputed'))`;

  console.log("Offer payment fields added successfully");
}

if (require.main === module) {
  addOfferPaymentFields().catch(console.error);
}

export { addOfferPaymentFields };
