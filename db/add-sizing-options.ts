import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_text_size TEXT DEFAULT 'medium'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_size TEXT DEFAULT 'medium'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_size TEXT DEFAULT 'medium'`;
  console.log("Sizing option columns added");
}
run().catch(console.error);
