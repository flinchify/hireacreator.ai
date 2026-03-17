import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`UPDATE users SET link_bio_bg_value = '' WHERE link_bio_bg_value IS NOT NULL AND link_bio_bg_value != '' AND link_bio_bg_value NOT LIKE 'http%' AND link_bio_bg_value NOT LIKE 'linear%'`;
  console.log("Cleared invalid bg values");
}
run().catch(console.error);
