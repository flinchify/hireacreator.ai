import { getDb } from "../lib/db";

async function main() {
  const sql = getDb();
  const rows = await sql`
    SELECT full_name, slug, headline, bio, location, 
      link_bio_template, link_bio_accent, link_bio_font, 
      link_bio_bg_type, link_bio_bg_value, link_bio_text_color,
      link_bio_button_shape, calendar_enabled
    FROM users WHERE slug = 'milesrunsai'
  `;
  console.log(JSON.stringify(rows[0], null, 2));
}
main().catch(console.error);
