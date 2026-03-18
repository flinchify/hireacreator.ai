import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS creator_stars (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, creator_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_creator_stars_user ON creator_stars(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_creator_stars_creator ON creator_stars(creator_id)`;

  console.log("creator_stars table created successfully");
}

run().catch(console.error);
