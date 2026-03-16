import { getDb } from "../lib/db";

async function setup() {
  const sql = getDb();
  
  // Find milesrunsai
  const users = await sql`SELECT id, email, slug, role FROM users WHERE slug LIKE '%milesrunsai%' OR email LIKE '%milesrunsai%'`;
  console.log("Found users:", users);
  
  if (users.length === 0) {
    // Try broader search
    const all = await sql`SELECT id, email, slug, role FROM users LIMIT 20`;
    console.log("All users:", all);
    return;
  }
  
  const uid = users[0].id;
  
  // Make admin + pro
  await sql`UPDATE users SET role = 'admin', subscription_tier = 'pro', has_intro_animation = true WHERE id = ${uid}`;
  console.log("Made admin + pro:", uid);
  
  // Grant all animation types
  const types = ['spotlight','glitch','particle-burst','typewriter','wave','neon','cinema','morph','ai-custom'];
  for (const t of types) {
    await sql`INSERT INTO profile_animations (user_id, animation_type, animation_css, is_active) VALUES (${uid}, ${t}, ${t}, false) ON CONFLICT DO NOTHING`;
  }
  console.log("Granted all animations");
}

setup().catch(console.error);
