import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`CREATE TABLE IF NOT EXISTS site_settings (key VARCHAR(50) PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`INSERT INTO site_settings (key, value) VALUES ('marketplace_open', 'true') ON CONFLICT (key) DO NOTHING`;
  console.log("site_settings table created with marketplace_open=true");
}
run().catch(console.error);
