import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function main() {
  const r = await sql`SELECT full_name,slug,headline,bio,location,category,link_bio_template,link_bio_accent,link_bio_bg_type,link_bio_bg_value,link_bio_font,link_bio_text_color,link_bio_card_style,link_bio_intro_anim,link_bio_bg_video,link_bio_button_shape,link_bio_button_anim,avatar_url,cover_url,calendar_enabled,onboarding_complete,email_verified FROM users WHERE slug='milesrunsai'`;
  console.log(JSON.stringify(r[0], null, 2));
  
  const socials = await sql`SELECT * FROM social_connections WHERE user_id = (SELECT id FROM users WHERE slug='milesrunsai')`;
  console.log("\nSocials:", socials.length);
  socials.forEach(s => console.log(`  ${s.platform}: ${s.handle} (${s.url})`));
  
  const services = await sql`SELECT * FROM services WHERE user_id = (SELECT id FROM users WHERE slug='milesrunsai')`;
  console.log("\nServices:", services.length);
  
  const links = await sql`SELECT * FROM bio_links WHERE user_id = (SELECT id FROM users WHERE slug='milesrunsai')`;
  console.log("\nBio Links:", links.length);
}
main();
