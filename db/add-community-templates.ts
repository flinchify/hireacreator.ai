import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS community_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      preview_url TEXT,
      settings JSONB NOT NULL DEFAULT '{}',
      is_public BOOLEAN DEFAULT false,
      use_count INT DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created community_templates");

  await sql`CREATE INDEX IF NOT EXISTS idx_community_templates_public ON community_templates(is_public, likes DESC) WHERE is_public = true`;
  await sql`CREATE INDEX IF NOT EXISTS idx_community_templates_creator ON community_templates(creator_id)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(console.error);
