import { getDb } from "../lib/db";
async function run() {
  const sql = getDb();
  await sql`INSERT INTO profile_animations (user_id, animation_type, animation_css, is_active) VALUES (${"f68bfd45-bc9e-4102-9a9b-9308b9ece4e2"}, ${"trading-candles"}, ${"trading-candles"}, false) ON CONFLICT DO NOTHING`;
  console.log("Granted trading-candles to admin");
}
run().catch(console.error);
