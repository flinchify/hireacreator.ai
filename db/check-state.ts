import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  const users = await sql`SELECT id, full_name, slug, email_verified, avatar_url, role FROM users`;
  console.log("Users:", JSON.stringify(users, null, 2));
  const socials = await sql`SELECT user_id, platform FROM social_connections`;
  console.log("Socials:", JSON.stringify(socials));
  const settings = await sql`SELECT key, value FROM site_settings`;
  console.log("Settings:", JSON.stringify(settings));
}
run().catch(console.error);
