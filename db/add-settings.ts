import { getDb } from "../lib/db";

async function addSettingsColumns() {
  const sql = getDb();

  // Password hash for email+password auth
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;

  // Email verification
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;

  // 2FA
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_backup_codes TEXT[]`;

  // Privacy settings
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_profile_public BOOLEAN DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_show_email BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_show_earnings BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_show_location BOOLEAN DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_allow_messages BOOLEAN DEFAULT TRUE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_searchable BOOLEAN DEFAULT TRUE`;

  // Login attempts tracking
  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255),
      ip_address INET,
      success BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, created_at)`;

  // Email verification tokens
  await sql`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_email_verif_token ON email_verifications(token)`;

  // Password reset tokens
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(128) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_pw_reset_token ON password_resets(token)`;

  console.log("Settings columns and tables added successfully");
}

addSettingsColumns().catch(console.error);
