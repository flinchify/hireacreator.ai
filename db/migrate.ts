import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Running migrations...");

  // Extension
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
  console.log("OK: pgcrypto extension");

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE,
      avatar_url TEXT,
      cover_url TEXT,
      bio TEXT,
      headline VARCHAR(255),
      location VARCHAR(255),
      role VARCHAR(20) NOT NULL DEFAULT 'creator',
      hourly_rate INTEGER,
      currency VARCHAR(3) DEFAULT 'USD',
      stripe_account_id VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      category VARCHAR(100),
      is_verified BOOLEAN DEFAULT FALSE,
      is_featured BOOLEAN DEFAULT FALSE,
      visible_in_marketplace BOOLEAN DEFAULT TRUE,
      total_earnings INTEGER DEFAULT 0,
      total_projects INTEGER DEFAULT 0,
      rating NUMERIC(3,2) DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: users");

  await sql`CREATE INDEX IF NOT EXISTS idx_users_slug ON users(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;

  // Social connections
  await sql`
    CREATE TABLE IF NOT EXISTS social_connections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      handle VARCHAR(255) NOT NULL,
      url TEXT,
      follower_count INTEGER DEFAULT 0,
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: social_connections");
  await sql`CREATE INDEX IF NOT EXISTS idx_social_user ON social_connections(user_id)`;

  // Services
  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      delivery_days INTEGER DEFAULT 7,
      category VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: services");
  await sql`CREATE INDEX IF NOT EXISTS idx_services_user ON services(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`;

  // Bookings
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id UUID NOT NULL REFERENCES services(id),
      client_id UUID NOT NULL REFERENCES users(id),
      creator_id UUID NOT NULL REFERENCES users(id),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      amount INTEGER NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      stripe_payment_intent_id VARCHAR(255),
      brief TEXT,
      due_date DATE,
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: bookings");
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_creator ON bookings(creator_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`;

  // Reviews
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
      reviewer_id UUID NOT NULL REFERENCES users(id),
      creator_id UUID NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: reviews");
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_creator ON reviews(creator_id)`;

  // Portfolio items
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      video_url TEXT,
      external_url TEXT,
      category VARCHAR(100),
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: portfolio_items");
  await sql`CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio_items(user_id)`;

  // Auth sessions
  await sql`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: auth_sessions");
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth_sessions(token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON auth_sessions(expires_at)`;

  // Auth codes
  await sql`
    CREATE TABLE IF NOT EXISTS auth_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: auth_codes");
  await sql`CREATE INDEX IF NOT EXISTS idx_auth_codes_email ON auth_codes(email)`;

  // API keys
  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL DEFAULT 'Default',
      key_prefix VARCHAR(12) NOT NULL,
      key_hash VARCHAR(128) NOT NULL,
      tier VARCHAR(20) NOT NULL DEFAULT 'free',
      scopes TEXT[] NOT NULL DEFAULT '{"read"}',
      is_active BOOLEAN DEFAULT TRUE,
      last_used_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: api_keys");
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix)`;

  // Rate limit log
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_log (
      id BIGSERIAL PRIMARY KEY,
      api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
      endpoint VARCHAR(100) NOT NULL,
      ip_address INET,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: rate_limit_log");
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limit_key_time ON rate_limit_log(api_key_id, created_at)`;

  // Rate limit tiers
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_tiers (
      tier VARCHAR(20) PRIMARY KEY,
      read_per_minute INTEGER NOT NULL DEFAULT 60,
      write_per_minute INTEGER NOT NULL DEFAULT 10,
      book_per_hour INTEGER NOT NULL DEFAULT 5,
      daily_cap INTEGER NOT NULL DEFAULT 100
    )
  `;
  console.log("OK: rate_limit_tiers");

  await sql`
    INSERT INTO rate_limit_tiers (tier, read_per_minute, write_per_minute, book_per_hour, daily_cap) VALUES
      ('free', 60, 10, 5, 100),
      ('pro', 1000, 100, 50, 10000),
      ('enterprise', 5000, 500, 500, 100000)
    ON CONFLICT (tier) DO NOTHING
  `;
  console.log("OK: rate_limit_tiers data");

  // Agent verifications
  await sql`
    CREATE TABLE IF NOT EXISTS agent_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      method VARCHAR(20) NOT NULL,
      domain VARCHAR(255) NOT NULL,
      verification_token VARCHAR(128) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 5,
      verified_at TIMESTAMP WITH TIME ZONE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log("OK: agent_verifications");
  await sql`CREATE INDEX IF NOT EXISTS idx_agent_verif_user ON agent_verifications(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_agent_verif_domain ON agent_verifications(domain)`;

  console.log("\nAll migrations complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
