import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`UPDATE users SET email_verified = TRUE, onboarding_complete = TRUE WHERE role = 'admin'`;
  console.log("Admin accounts marked as verified + onboarded");
}
run().catch(console.error);
