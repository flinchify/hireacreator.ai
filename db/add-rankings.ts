import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INT DEFAULT 0`;
    console.log("Added profile_views to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS niche_rank INT DEFAULT 0`;
    console.log("Added niche_rank to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_users_category_views ON users(category, profile_views DESC)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
