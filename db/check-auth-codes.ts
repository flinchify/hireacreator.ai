import { getDb } from "../lib/db";
async function check() {
  const sql = getDb();
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'auth_codes' ORDER BY ordinal_position`;
  console.log("auth_codes columns:", cols);
  
  // Ensure role column exists
  await sql`ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'creator'`;
  await sql`ALTER TABLE auth_codes ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE`;
  console.log("Ensured role and used columns exist");
}
check().catch(console.error);
