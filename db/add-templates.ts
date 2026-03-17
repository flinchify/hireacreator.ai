import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_template VARCHAR(30) DEFAULT 'minimal'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_accent VARCHAR(7) DEFAULT '#171717'`;
  console.log("Added link_bio_template + link_bio_accent columns");
}
run().catch(console.error);
