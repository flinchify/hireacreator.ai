import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }
  const sql = neon(databaseUrl);

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'`;
    console.log("Added verification_status");
  } catch (e: any) { console.log("Column may exist:", e.message); }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ`;
    console.log("Added verification_submitted_at");
  } catch (e: any) { console.log("Column may exist:", e.message); }

  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_notes TEXT`;
    console.log("Added verification_notes");
  } catch (e: any) { console.log("Column may exist:", e.message); }

  console.log("\nDone!");
}

migrate().catch(e => { console.error(e); process.exit(1); });
