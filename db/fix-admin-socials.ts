import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  const adminId = "f68bfd45-bc9e-4102-9a9b-9308b9ece4e2";
  // Add socials for admin
  await sql`INSERT INTO social_connections (user_id, platform, handle, url) VALUES (${adminId}, 'twitter', '@hireacreatorAI', 'https://x.com/hireacreatorAI') ON CONFLICT DO NOTHING`;
  await sql`INSERT INTO social_connections (user_id, platform, handle, url) VALUES (${adminId}, 'tiktok', '@milesrunsai', 'https://tiktok.com/@milesrunsai') ON CONFLICT DO NOTHING`;
  console.log("Admin socials added");
}
run().catch(console.error);
