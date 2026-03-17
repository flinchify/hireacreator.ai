import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_type VARCHAR(20) DEFAULT 'gradient'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_value TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_video TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_shape VARCHAR(20) DEFAULT 'rounded'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_anim VARCHAR(20) DEFAULT 'none'`;
  console.log("Link in bio editor columns added");
}
run().catch(console.error);
