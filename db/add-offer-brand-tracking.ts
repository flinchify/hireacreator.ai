import { getDb } from "@/lib/db";

async function addOfferBrandTracking() {
  const sql = getDb();

  console.log("Adding brand_platform and brand_handle columns to offers...");

  // Add brand_platform and brand_handle for tracking non-signed-up brands
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS brand_platform TEXT`;
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS brand_handle TEXT`;

  // Make brand_user_id nullable (for offers from non-signed-up brands)
  await sql`ALTER TABLE offers ALTER COLUMN brand_user_id DROP NOT NULL`;

  // Index for linking offers when brand signs up
  await sql`CREATE INDEX IF NOT EXISTS idx_offers_brand_handle ON offers(brand_platform, brand_handle)`;

  console.log("Done: brand_platform, brand_handle columns added to offers");
}

if (require.main === module) {
  addOfferBrandTracking().catch(console.error);
}

export { addOfferBrandTracking };
