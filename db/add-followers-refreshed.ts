import { readFileSync } from "fs";
import { resolve } from "path";
// Load .env manually
const envPath = resolve(__dirname, "../.env");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}
import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();
  await sql`ALTER TABLE social_connections ADD COLUMN IF NOT EXISTS followers_refreshed_at TIMESTAMPTZ`;
  console.log("Added followers_refreshed_at column to social_connections");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
