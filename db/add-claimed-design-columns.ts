import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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

  console.log("Adding AI design columns to claimed_profiles...");

  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_template VARCHAR(50)`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_type VARCHAR(20)`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_bg_value TEXT`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_text_color VARCHAR(20)`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_font VARCHAR(50)`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_button_shape VARCHAR(20)`;
  await sql`ALTER TABLE claimed_profiles ADD COLUMN IF NOT EXISTS link_bio_headline TEXT`;

  console.log("Migration complete!");
}

migrate().catch(console.error);
