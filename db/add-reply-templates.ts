import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }
  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS reply_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      use_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created reply_templates");

  await sql`CREATE INDEX IF NOT EXISTS idx_reply_templates_user ON reply_templates(user_id)`;
  console.log("Created index\n\nDone!");
}

migrate().catch(e => { console.error(e); process.exit(1); });
