import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS bio_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      icon VARCHAR(50),
      position INT NOT NULL DEFAULT 0,
      is_visible BOOLEAN DEFAULT true,
      is_pinned BOOLEAN DEFAULT false,
      click_count INT DEFAULT 0,
      schedule_start TIMESTAMPTZ,
      schedule_end TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created bio_links");

  await sql`CREATE INDEX IF NOT EXISTS idx_bio_links_user ON bio_links(user_id, position)`;
  console.log("Created index");
  console.log("\nDone!");
}

migrate().catch(console.error);
