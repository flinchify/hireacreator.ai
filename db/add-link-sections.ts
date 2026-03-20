import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  await sql`ALTER TABLE bio_links ADD COLUMN IF NOT EXISTS section_name TEXT DEFAULT NULL`;
  await sql`ALTER TABLE bio_links ADD COLUMN IF NOT EXISTS display_style TEXT DEFAULT 'button'`;

  console.log("Done: added section_name and display_style to bio_links");
  process.exit(0);
}

run().catch(console.error);
