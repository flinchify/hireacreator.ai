import { neon } from "@neondatabase/serverless";

async function run() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`CREATE TABLE IF NOT EXISTS profile_animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animation_type VARCHAR(50) NOT NULL DEFAULT 'auto',
    animation_css TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS idx_profile_anim_user ON profile_animations(user_id)`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_intro_animation BOOLEAN DEFAULT FALSE`;
  console.log("Animation tables created");
}
run().catch(console.error);
