import { neon } from "@neondatabase/serverless";
const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function migrate() {
  // Availability: recurring weekly slots a creator offers
  await sql`
    CREATE TABLE IF NOT EXISTS availability_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created availability_slots");

  // Calendar sessions: bookable time-based services
  await sql`
    CREATE TABLE IF NOT EXISTS calendar_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      duration_minutes INT NOT NULL DEFAULT 30,
      price_cents INT NOT NULL DEFAULT 0,
      currency VARCHAR(3) DEFAULT 'AUD',
      color VARCHAR(7) DEFAULT '#171717',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created calendar_sessions");

  // Calendar bookings: actual booked appointments
  await sql`
    CREATE TABLE IF NOT EXISTS calendar_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES calendar_sessions(id) ON DELETE CASCADE,
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES users(id) ON DELETE SET NULL,
      client_name VARCHAR(200),
      client_email VARCHAR(200),
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      timezone VARCHAR(50) DEFAULT 'Australia/Sydney',
      status VARCHAR(20) DEFAULT 'pending',
      stripe_payment_id VARCHAR(200),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created calendar_bookings");

  // Add calendar_enabled to users
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_enabled BOOLEAN DEFAULT false`;
    console.log("Added calendar_enabled to users");
  } catch (e: any) {
    console.log("Column may exist:", e.message);
  }

  await sql`CREATE INDEX IF NOT EXISTS idx_availability_user ON availability_slots(user_id, day_of_week)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cal_sessions_user ON calendar_sessions(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cal_bookings_creator ON calendar_bookings(creator_id, date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cal_bookings_session ON calendar_bookings(session_id, date)`;
  console.log("Created indexes\n\nDone!");
}

migrate().catch(e => console.error(e));
