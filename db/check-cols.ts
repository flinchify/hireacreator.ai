import { getDb } from "../lib/db";

async function main() {
  const sql = getDb();
  
  // Check bio_links columns
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'bio_links'`;
  console.log("bio_links columns:", cols.map((c: any) => c.column_name).join(", "));
  
  // Check if is_archived exists
  const hasArchived = cols.some((c: any) => c.column_name === "is_archived");
  console.log("has is_archived:", hasArchived);
  
  // Test the actual query that getCreatorBySlug runs
  const user = await sql`SELECT id FROM users WHERE slug = 'milesrunsai' LIMIT 1`;
  if (user.length === 0) { console.log("No user found"); return; }
  const uid = user[0].id;
  
  try {
    const links = await sql`SELECT * FROM bio_links WHERE user_id = ${uid} AND is_visible = TRUE AND (is_archived = FALSE OR is_archived IS NULL) ORDER BY position ASC`;
    console.log("bio_links count:", links.length);
    if (links.length > 0) console.log("First link:", JSON.stringify(links[0]));
  } catch (e: any) {
    console.error("bio_links query ERROR:", e.message);
  }
}
main().catch(console.error);
