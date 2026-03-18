import { getDb } from "../lib/db";

async function main() {
  const sql = getDb();
  
  // Read current state
  const before = await sql`
    SELECT link_bio_template, link_bio_font, link_bio_button_shape, link_bio_accent, 
           link_bio_bg_type, link_bio_bg_value, calendar_enabled
    FROM users WHERE slug = 'milesrunsai'
  `;
  console.log("BEFORE:", JSON.stringify(before[0]));
  
  // Simulate what the editor PATCH does
  await sql`
    UPDATE users SET
      link_bio_template = 'split',
      link_bio_font = 'poppins',
      link_bio_button_shape = 'pill',
      updated_at = NOW()
    WHERE slug = 'milesrunsai'
  `;
  
  // Read after
  const after = await sql`
    SELECT link_bio_template, link_bio_font, link_bio_button_shape
    FROM users WHERE slug = 'milesrunsai'
  `;
  console.log("AFTER:", JSON.stringify(after[0]));
  
  // Reset to what user had
  await sql`
    UPDATE users SET
      link_bio_template = ${before[0].link_bio_template},
      link_bio_font = ${before[0].link_bio_font},
      link_bio_button_shape = ${before[0].link_bio_button_shape},
      updated_at = NOW()
    WHERE slug = 'milesrunsai'
  `;
  console.log("RESET back to original");
}
main().catch(console.error);
