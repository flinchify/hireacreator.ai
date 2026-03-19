import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS service_packages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      tier TEXT NOT NULL CHECK (tier IN ('basic', 'standard', 'premium')),
      title TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      delivery_days INTEGER NOT NULL DEFAULT 7,
      revisions INTEGER DEFAULT 1,
      features JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(service_id, tier)
    )
  `;
  console.log("Created service_packages table");

  await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_service ON service_packages(service_id)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
