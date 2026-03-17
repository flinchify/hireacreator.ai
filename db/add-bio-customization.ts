import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_font VARCHAR(30) DEFAULT 'jakarta'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_text_color VARCHAR(7) DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_images TEXT DEFAULT ''`; // JSON array of image URLs
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_intro_anim VARCHAR(30) DEFAULT 'none'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_card_style VARCHAR(20) DEFAULT 'default'`;
  console.log("Bio customization columns added");
}
run().catch(console.error);
