import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function main() {
  // Reset the background to a clean default since the current one renders wrong
  // Also set a reasonable default template
  await sql`
    UPDATE users SET
      link_bio_bg_type = 'gradient',
      link_bio_bg_value = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link_bio_template = 'minimal'
    WHERE slug = 'milesrunsai'
  `;
  console.log("Fixed milesrunsai profile template + bg");
}
main();
