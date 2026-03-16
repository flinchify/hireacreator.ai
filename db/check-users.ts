import { getDb } from "../lib/db";
async function check() {
  const sql = getDb();
  const rows = await sql`SELECT id, slug, role, full_name FROM users LIMIT 10`;
  console.log(JSON.stringify(rows, null, 2));
}
check().catch(console.error);
