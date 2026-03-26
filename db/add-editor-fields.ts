import { getDb } from "../lib/db";

async function run() {
  const sql = getDb();

  // Typography
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_font_size TEXT DEFAULT 'medium'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_font_weight INTEGER DEFAULT 400`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_letter_spacing TEXT DEFAULT 'normal'`;

  // Spacing & Layout
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_page_padding INTEGER DEFAULT 16`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_section_gap INTEGER DEFAULT 16`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_container_width TEXT DEFAULT 'standard'`;

  // Avatar
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_shape TEXT DEFAULT 'circle'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_border_width INTEGER DEFAULT 0`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_border_color TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_shadow TEXT DEFAULT 'none'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_mode TEXT DEFAULT 'photo'`;

  // Button styling
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_fill TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_text_color TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border_width INTEGER DEFAULT 1`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border_color TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_shadow TEXT DEFAULT 'none'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_width TEXT DEFAULT 'standard'`;

  // Gradient
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_direction TEXT DEFAULT '135deg'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_color1 TEXT DEFAULT ''`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_color2 TEXT DEFAULT ''`;

  // Background overlay
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_overlay TEXT DEFAULT 'dark'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_overlay_opacity INTEGER DEFAULT 40`;

  // Glass / Blur
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_glass_enabled BOOLEAN DEFAULT FALSE`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_glass_intensity INTEGER DEFAULT 8`;

  // Animation
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_hover_effect TEXT DEFAULT 'none'`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_anim_speed TEXT DEFAULT 'normal'`;

  // Blocks
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_blocks TEXT DEFAULT ''`;

  console.log("All editor fields added successfully");
}

run().catch(console.error);
