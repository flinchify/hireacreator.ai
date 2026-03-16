import { getDb } from "../lib/db";

async function addAdminColumns() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_by UUID`;
  console.log("Admin columns added");
}

addAdminColumns().catch(console.error);
