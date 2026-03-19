import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS creator_score INT DEFAULT 0`;
    console.log("Added creator_score to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb`;
    console.log("Added score_breakdown to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS score_updated_at TIMESTAMPTZ`;
    console.log("Added score_updated_at to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_users_creator_score ON users(creator_score DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_category_score ON users(category, creator_score DESC)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
