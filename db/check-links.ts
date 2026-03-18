import { getDb } from "../lib/db";

async function main() {
  const sql = getDb();
  const user = await sql`SELECT id FROM users WHERE slug = 'milesrunsai'`;
  const uid = user[0].id;
  
  // Get ALL links, no filters
  const all = await sql`SELECT id, title, url, is_visible, is_archived, is_pinned, position FROM bio_links WHERE user_id = ${uid} ORDER BY position`;
  console.log("ALL bio_links (unfiltered):");
  all.forEach((l: any) => console.log(`  ${l.title} | visible=${l.is_visible} | archived=${l.is_archived} | pos=${l.position}`));
  
  // Get filtered (what the query uses)
  const filtered = await sql`SELECT id, title FROM bio_links WHERE user_id = ${uid} AND is_visible = TRUE AND (is_archived = FALSE OR is_archived IS NULL) ORDER BY position`;
  console.log("\nFiltered (what getCreatorBySlug returns):");
  filtered.forEach((l: any) => console.log(`  ${l.title}`));
  console.log(`Count: ${filtered.length}`);
}
main().catch(console.error);
