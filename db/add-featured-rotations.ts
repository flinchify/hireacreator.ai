import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS featured_rotations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id),
      week_start DATE NOT NULL,
      week_end DATE NOT NULL,
      position INTEGER DEFAULT 0,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(creator_id, week_start)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_featured_rotations_week ON featured_rotations(week_start, week_end)
  `;

  console.log("Featured rotations table created");
}

run().catch(console.error);
