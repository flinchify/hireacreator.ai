import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_name TEXT NOT NULL,
      client_company TEXT,
      client_avatar TEXT,
      content TEXT NOT NULL,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      source TEXT,
      screenshot_url TEXT,
      display_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created testimonials table");

  await sql`CREATE INDEX IF NOT EXISTS idx_testimonials_user ON testimonials(user_id)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
