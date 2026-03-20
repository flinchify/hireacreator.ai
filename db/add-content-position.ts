import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_content_position TEXT DEFAULT 'top'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_content_align TEXT DEFAULT 'center'`;
  console.log("Content position/alignment columns added");
}
run().catch(console.error);
