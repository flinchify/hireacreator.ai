import { getDb } from "../lib/db";

async function grantAdminAnimations() {
  const sql = getDb();
  const adminId = "f68bfd45-bc9e-4102-9a9b-9308b9ece4e2";
  const types = ["spotlight", "glitch", "particle-burst", "typewriter", "wave", "neon", "cinema", "morph", "ai-custom"];

  // Check existing
  const existing = await sql`SELECT animation_type FROM profile_animations WHERE user_id = ${adminId}`;
  const existingTypes = existing.map((r: any) => r.animation_type);
  console.log("Existing:", existingTypes);

  for (const type of types) {
    if (!existingTypes.includes(type)) {
      await sql`INSERT INTO profile_animations (user_id, animation_type, is_active) VALUES (${adminId}, ${type}, false)`;
      console.log(`Granted: ${type}`);
    } else {
      console.log(`Already has: ${type}`);
    }
  }

  // Also ensure has_intro_animation flag
  await sql`UPDATE users SET has_intro_animation = true WHERE id = ${adminId}`;
  console.log("Done — all 9 animations granted to admin");
}

grantAdminAnimations().catch(console.error);
