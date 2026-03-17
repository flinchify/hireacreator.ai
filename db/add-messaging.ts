import { neon } from "@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function migrate() {
  // Conversations between two users
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      participant_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_message_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(participant_a, participant_b)
    )
  `;
  console.log("Created conversations table");

  // Messages
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_flagged BOOLEAN DEFAULT false,
      flag_reason TEXT,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created messages table");

  // Message reports
  await sql`
    CREATE TABLE IF NOT EXISTS message_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      admin_notes TEXT,
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created message_reports table");

  // Add age verification and content warning columns to users
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_18_plus_content BOOLEAN DEFAULT false`;
    console.log("Added age_verified, age_verified_at, is_18_plus_content to users");
  } catch (e: any) {
    console.log("User columns may already exist:", e.message);
  }

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_conversations_participant_a ON conversations(participant_a)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_conversations_participant_b ON conversations(participant_b)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports(status)`;
  console.log("Created indexes");

  console.log("\nDone!");
}

migrate().catch(e => console.error("Migration failed:", e));
