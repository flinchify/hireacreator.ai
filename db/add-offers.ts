import { getDb } from "@/lib/db";

async function addOffers() {
  const sql = getDb();

  console.log("Adding offers table...");

  // Create the offers table
  await sql`
    CREATE TABLE IF NOT EXISTS offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_user_id UUID NOT NULL REFERENCES users(id),
      creator_handle TEXT NOT NULL,
      creator_platform TEXT NOT NULL CHECK (creator_platform IN ('instagram', 'tiktok', 'youtube', 'x')),
      creator_user_id UUID REFERENCES users(id),
      budget_cents INTEGER NOT NULL CHECK (budget_cents > 0 AND budget_cents < 10000000),
      brief TEXT NOT NULL,
      deliverables TEXT NOT NULL,
      timeline_days INTEGER NOT NULL DEFAULT 14,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'declined', 'countered', 'expired')),
      counter_budget_cents INTEGER,
      counter_message TEXT,
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_offers_creator ON offers(creator_platform, creator_handle)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_offers_brand ON offers(brand_user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status)`;

  console.log("✅ Offers table and indexes created successfully");
}

if (require.main === module) {
  addOffers().catch(console.error);
}

export { addOffers };