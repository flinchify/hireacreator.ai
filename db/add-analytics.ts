import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Running analytics migrations...");

  // Profile views (detailed tracking)
  await sql`
    CREATE TABLE IF NOT EXISTS profile_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id),
      viewer_ip TEXT,
      referrer TEXT,
      user_agent TEXT,
      country TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("OK: profile_views");

  await sql`CREATE INDEX IF NOT EXISTS idx_profile_views_creator ON profile_views(creator_id, created_at)`;

  // Link clicks
  await sql`
    CREATE TABLE IF NOT EXISTS link_clicks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id),
      link_type TEXT NOT NULL,
      link_target TEXT NOT NULL,
      referrer TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("OK: link_clicks");

  await sql`CREATE INDEX IF NOT EXISTS idx_link_clicks_creator ON link_clicks(creator_id, created_at)`;

  // Enquiry log
  await sql`
    CREATE TABLE IF NOT EXISTS enquiry_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creator_id UUID NOT NULL REFERENCES users(id),
      enquirer_name TEXT,
      enquirer_email TEXT,
      budget TEXT,
      project_type TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("OK: enquiry_log");

  await sql`CREATE INDEX IF NOT EXISTS idx_enquiry_log_creator ON enquiry_log(creator_id, created_at)`;

  // Add payout columns to bookings
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending'`;
  await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_date TIMESTAMPTZ`;
  console.log("OK: bookings payout columns");

  console.log("\nAll analytics migrations complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
