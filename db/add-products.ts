import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS creator_products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      title VARCHAR(200) NOT NULL,
      description TEXT,
      price_cents INT DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'AUD',
      product_url TEXT,
      thumbnail_url TEXT,
      product_type VARCHAR(50) DEFAULT 'digital',
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created creator_products table");

  await sql`CREATE INDEX IF NOT EXISTS idx_products_user ON creator_products(user_id, sort_order)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
