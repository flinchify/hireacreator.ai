import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function main() {
  const user = await sql`SELECT calendar_enabled FROM users WHERE email = 'milesrunsai@gmail.com'`;
  console.log("calendar_enabled:", user[0]?.calendar_enabled);
  
  // Enable it
  await sql`UPDATE users SET calendar_enabled = true WHERE email = 'milesrunsai@gmail.com'`;
  console.log("Set calendar_enabled = true");
}
main().catch(console.error);
