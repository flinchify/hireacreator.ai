import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env manually
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Creating claimed_profiles table...");
  await sql`
    CREATE TABLE IF NOT EXISTS claimed_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram','tiktok','x','youtube')),
      platform_handle VARCHAR(255) NOT NULL,
      platform_id VARCHAR(255),
      display_name VARCHAR(255),
      avatar_url TEXT,
      bio TEXT,
      follower_count INTEGER DEFAULT 0,
      following_count INTEGER DEFAULT 0,
      post_count INTEGER DEFAULT 0,
      engagement_rate NUMERIC(5,2) DEFAULT 0,
      niche VARCHAR(100),
      creator_score INTEGER DEFAULT 0,
      score_breakdown JSONB DEFAULT '{}',
      estimated_post_value INTEGER DEFAULT 0,
      auto_profile_slug VARCHAR(100) UNIQUE,
      claimed_by UUID REFERENCES users(id) ON DELETE SET NULL,
      claimed_at TIMESTAMPTZ,
      referrer_handle VARCHAR(255),
      source_post_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(platform, platform_handle)
    )
  `;

  console.log("Creating tag_events table...");
  await sql`
    CREATE TABLE IF NOT EXISTS tag_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform VARCHAR(20) NOT NULL,
      tagged_handle VARCHAR(255) NOT NULL,
      tagger_handle VARCHAR(255),
      source_url TEXT,
      post_id VARCHAR(255),
      comment_reply_id VARCHAR(255),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','profile_created','replied','failed')),
      error_message TEXT,
      ip_address INET,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating brand_campaigns table...");
  await sql`
    CREATE TABLE IF NOT EXISTS brand_campaigns (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      budget_cents INTEGER,
      budget_per_creator_cents INTEGER,
      niche VARCHAR(100),
      min_followers INTEGER DEFAULT 0,
      max_followers INTEGER,
      platforms TEXT[] DEFAULT '{}',
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
      applications_count INTEGER DEFAULT 0,
      max_creators INTEGER DEFAULT 10,
      deadline TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating campaign_applications table...");
  await sql`
    CREATE TABLE IF NOT EXISTS campaign_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      campaign_id UUID REFERENCES brand_campaigns(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      claimed_profile_id UUID REFERENCES claimed_profiles(id) ON DELETE CASCADE,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
      pitch TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS idx_claimed_platform_handle ON claimed_profiles(platform, platform_handle)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimed_slug ON claimed_profiles(auto_profile_slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimed_niche ON claimed_profiles(niche)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimed_score ON claimed_profiles(creator_score DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_claimed_by ON claimed_profiles(claimed_by)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tag_events_handle ON tag_events(tagged_handle)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tag_events_ip ON tag_events(ip_address, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tag_events_status ON tag_events(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON brand_campaigns(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_niche ON brand_campaigns(niche)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_apps_campaign ON campaign_applications(campaign_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_campaign_apps_user ON campaign_applications(user_id)`;

  console.log("Migration complete!");
}

migrate().catch(console.error);
