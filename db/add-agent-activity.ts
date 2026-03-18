import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL || "");

async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS agent_activity (
      id BIGSERIAL PRIMARY KEY,
      agent_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
      agent_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(50) NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("Created agent_activity table");

  await sql`CREATE INDEX IF NOT EXISTS idx_agent_activity_key ON agent_activity(agent_key_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_agent_activity_user ON agent_activity(agent_user_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_agent_activity_action ON agent_activity(action)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
