import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function main() {
  await sql`UPDATE users SET
    headline = 'Building the future of creator commerce',
    bio = 'Founder of HireACreator.ai. 18, building a marketplace where creators keep 100% of their earnings. Based in Sydney.',
    location = 'Sydney, Australia',
    category = 'Developer'
  WHERE slug = 'milesrunsai'`;
  console.log("Profile updated");
  const r = await sql`SELECT headline, bio, location, category FROM users WHERE slug = 'milesrunsai'`;
  console.log(r[0]);
}
main();
