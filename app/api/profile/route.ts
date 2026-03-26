import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { calculateAndSaveScore } from "@/lib/creator-score";

// Ensure all editor columns exist
let migrated = false;
async function ensureColumns() {
  if (migrated) return;
  const sql = getDb();
  const cols = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS hide_branding BOOLEAN DEFAULT false`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS header_image_url TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_font_size TEXT DEFAULT 'medium'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_font_weight INTEGER DEFAULT 400`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_letter_spacing TEXT DEFAULT 'normal'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_page_padding INTEGER DEFAULT 16`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_section_gap INTEGER DEFAULT 16`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_container_width TEXT DEFAULT 'standard'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_shape TEXT DEFAULT 'circle'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_border_width INTEGER DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_border_color TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_shadow TEXT DEFAULT 'none'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_avatar_mode TEXT DEFAULT 'photo'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_fill TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_text_color TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border_width INTEGER DEFAULT 1`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_border_color TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_shadow TEXT DEFAULT 'none'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_button_width TEXT DEFAULT 'standard'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_direction TEXT DEFAULT '135deg'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_color1 TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_gradient_color2 TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_overlay TEXT DEFAULT 'dark'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_bg_overlay_opacity INTEGER DEFAULT 40`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_glass_enabled BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_glass_intensity INTEGER DEFAULT 8`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_hover_effect TEXT DEFAULT 'none'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_anim_speed TEXT DEFAULT 'normal'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS link_bio_blocks TEXT DEFAULT ''`,
  ];
  // Run each ALTER individually so one failure doesn't block the rest
  for (const ddl of cols) {
    try {
      // Neon serverless uses tagged templates; use template literal workaround for raw DDL
      await sql(ddl as any, [] as any);
    } catch (e: any) {
      // Ignore "column already exists" errors, log others
      if (!e?.message?.includes("already exists")) {
        console.error("[ensureColumns] Failed:", ddl.slice(0, 80), e?.message);
      }
    }
  }
  migrated = true;
}

async function getUser() {
  await ensureColumns();
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();
    const [socials, services, portfolio] = await Promise.all([
      sql`SELECT * FROM social_connections WHERE user_id = ${user.id} ORDER BY created_at`,
      sql`SELECT * FROM services WHERE user_id = ${user.id} ORDER BY created_at`,
      sql`SELECT * FROM portfolio_items WHERE user_id = ${user.id} ORDER BY sort_order`,
    ]);

    return NextResponse.json({ user, socials, services, portfolio });
  } catch (e) {
    console.error('[API /profile GET] Error:', e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const sql = getDb();

    // Validate slug if changing
    if (body.slug !== undefined && body.slug !== null) {
      const slugStr = String(body.slug).toLowerCase().trim();
      if (slugStr.length < 3 || slugStr.length > 30) {
        return NextResponse.json({ error: "slug_invalid", message: "URL handle must be 3–30 characters." }, { status: 400 });
      }
      if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slugStr)) {
        return NextResponse.json({ error: "slug_invalid", message: "Only lowercase letters, numbers, and hyphens allowed. Cannot start or end with a hyphen." }, { status: 400 });
      }
      const existing = await sql`SELECT id FROM users WHERE slug = ${slugStr} AND id != ${user.id}`;
      if (existing.length > 0) {
        return NextResponse.json({ error: "slug_taken", message: "That URL is already in use. Try another." }, { status: 400 });
      }
      body.slug = slugStr;
    }

    // Core fields (always exist) — must succeed
    await sql`
      UPDATE users SET
        full_name = COALESCE(${body.full_name ?? null}, full_name),
        slug = COALESCE(${body.slug ?? null}, slug),
        headline = COALESCE(${body.headline ?? null}, headline),
        bio = COALESCE(${body.bio ?? null}, bio),
        location = COALESCE(${body.location ?? null}, location),
        category = COALESCE(${body.category ?? null}, category),
        hourly_rate = COALESCE(${body.hourly_rate ?? null}, hourly_rate),
        currency = COALESCE(${body.currency ?? null}, currency),
        website_url = ${body.website_url !== undefined ? body.website_url : user.website_url},
        business_name = ${body.business_name !== undefined ? body.business_name : user.business_name},
        business_url = ${body.business_url !== undefined ? body.business_url : user.business_url},
        avatar_url = ${body.avatar_url !== undefined ? body.avatar_url : user.avatar_url},
        cover_url = ${body.cover_url !== undefined ? body.cover_url : user.cover_url},
        logo_url = ${body.logo_url !== undefined ? body.logo_url : user.logo_url},
        header_image_url = ${body.header_image_url !== undefined ? body.header_image_url : user.header_image_url},
        is_online = COALESCE(${body.is_online ?? null}, is_online),
        visible_in_marketplace = COALESCE(${body.visible_in_marketplace ?? null}, visible_in_marketplace),
        link_bio_template = COALESCE(${body.link_bio_template ?? null}, link_bio_template),
        link_bio_accent = COALESCE(${body.link_bio_accent ?? null}, link_bio_accent),
        link_bio_bg_type = COALESCE(${body.link_bio_bg_type ?? null}, link_bio_bg_type),
        link_bio_bg_value = ${body.link_bio_bg_value !== undefined ? body.link_bio_bg_value : user.link_bio_bg_value},
        link_bio_bg_video = ${body.link_bio_bg_video !== undefined ? body.link_bio_bg_video : user.link_bio_bg_video},
        link_bio_button_shape = COALESCE(${body.link_bio_button_shape ?? null}, link_bio_button_shape),
        link_bio_button_anim = COALESCE(${body.link_bio_button_anim ?? null}, link_bio_button_anim),
        onboarding_complete = COALESCE(${body.onboarding_complete ?? null}, onboarding_complete),
        link_bio_font = COALESCE(${body.link_bio_font ?? null}, link_bio_font),
        link_bio_text_color = ${body.link_bio_text_color !== undefined ? body.link_bio_text_color : user.link_bio_text_color},
        link_bio_bg_images = ${body.link_bio_bg_images !== undefined ? body.link_bio_bg_images : user.link_bio_bg_images},
        link_bio_intro_anim = COALESCE(${body.link_bio_intro_anim ?? null}, link_bio_intro_anim),
        link_bio_card_style = COALESCE(${body.link_bio_card_style ?? null}, link_bio_card_style),
        link_bio_text_size = COALESCE(${body.link_bio_text_size ?? null}, link_bio_text_size),
        link_bio_avatar_size = COALESCE(${body.link_bio_avatar_size ?? null}, link_bio_avatar_size),
        link_bio_button_size = COALESCE(${body.link_bio_button_size ?? null}, link_bio_button_size),
        link_bio_content_position = COALESCE(${body.link_bio_content_position ?? null}, link_bio_content_position),
        link_bio_content_align = COALESCE(${body.link_bio_content_align ?? null}, link_bio_content_align),
        hide_branding = COALESCE(${body.hide_branding ?? null}, hide_branding),
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Extended editor fields — save individually so missing columns don't break core saves
    const extFields: [string, any][] = [
      ["link_bio_font_size", body.link_bio_font_size],
      ["link_bio_font_weight", body.link_bio_font_weight],
      ["link_bio_letter_spacing", body.link_bio_letter_spacing],
      ["link_bio_page_padding", body.link_bio_page_padding],
      ["link_bio_section_gap", body.link_bio_section_gap],
      ["link_bio_container_width", body.link_bio_container_width],
      ["link_bio_avatar_shape", body.link_bio_avatar_shape],
      ["link_bio_avatar_border_width", body.link_bio_avatar_border_width],
      ["link_bio_avatar_border_color", body.link_bio_avatar_border_color],
      ["link_bio_avatar_shadow", body.link_bio_avatar_shadow],
      ["link_bio_avatar_mode", body.link_bio_avatar_mode],
      ["link_bio_button_fill", body.link_bio_button_fill],
      ["link_bio_button_text_color", body.link_bio_button_text_color],
      ["link_bio_button_border", body.link_bio_button_border],
      ["link_bio_button_border_width", body.link_bio_button_border_width],
      ["link_bio_button_border_color", body.link_bio_button_border_color],
      ["link_bio_button_shadow", body.link_bio_button_shadow],
      ["link_bio_button_width", body.link_bio_button_width],
      ["link_bio_gradient_direction", body.link_bio_gradient_direction],
      ["link_bio_gradient_color1", body.link_bio_gradient_color1],
      ["link_bio_gradient_color2", body.link_bio_gradient_color2],
      ["link_bio_bg_overlay", body.link_bio_bg_overlay],
      ["link_bio_bg_overlay_opacity", body.link_bio_bg_overlay_opacity],
      ["link_bio_glass_enabled", body.link_bio_glass_enabled],
      ["link_bio_glass_intensity", body.link_bio_glass_intensity],
      ["link_bio_hover_effect", body.link_bio_hover_effect],
      ["link_bio_anim_speed", body.link_bio_anim_speed],
      ["link_bio_blocks", body.link_bio_blocks],
    ];
    // Build a single UPDATE for all provided extended fields
    const setters: string[] = [];
    const values: any[] = [];
    for (const [col, val] of extFields) {
      if (val !== undefined) {
        setters.push(`${col} = $${values.length + 1}`);
        values.push(val);
      }
    }
    if (setters.length > 0) {
      // Save extended fields individually to avoid missing column errors
      for (const [col, val] of extFields) {
        if (val !== undefined) {
          try {
            await sql(`UPDATE users SET ${col} = $1 WHERE id = $2` as any, [val, user.id] as any);
          } catch (e: any) {
            // Column might not exist yet — don't fail the whole request
            if (!e?.message?.includes("does not exist")) {
              console.error(`[PATCH] Failed to save ${col}:`, e?.message);
            }
          }
        }
      }
    }

    // Fire-and-forget score recalculation
    calculateAndSaveScore(user.id).catch((err) =>
      console.error("[API /profile PATCH] Score recalc failed:", err)
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[API /profile PATCH] Error:', e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
