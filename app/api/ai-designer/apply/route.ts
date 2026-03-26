import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { pageSpecToDbFields } from "@/lib/page-schema";
import type { PageSpec } from "@/lib/page-schema";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { pageSpec } = body as { pageSpec: PageSpec };

    if (!pageSpec || !pageSpec.designTokens) {
      return NextResponse.json({ error: "Invalid pageSpec" }, { status: 400 });
    }

    const fields = pageSpecToDbFields(pageSpec);
    const sql = getDb();

    // Build dynamic UPDATE query from the fields
    // The fields object has keys like link_bio_template, link_bio_font, etc.
    await sql`
      UPDATE users SET
        link_bio_template = ${fields.link_bio_template},
        link_bio_font = ${fields.link_bio_font},
        link_bio_text_color = ${fields.link_bio_text_color},
        link_bio_accent = ${fields.link_bio_accent},
        link_bio_bg_type = ${fields.link_bio_bg_type},
        link_bio_bg_value = ${fields.link_bio_bg_value},
        link_bio_button_shape = ${fields.link_bio_button_shape},
        link_bio_button_anim = ${fields.link_bio_button_anim},
        link_bio_button_fill = ${fields.link_bio_button_fill},
        link_bio_button_text_color = ${fields.link_bio_button_text_color},
        link_bio_button_shadow = ${fields.link_bio_button_shadow},
        link_bio_font_size = ${fields.link_bio_font_size},
        link_bio_font_weight = ${fields.link_bio_font_weight},
        link_bio_avatar_mode = ${fields.link_bio_avatar_mode},
        link_bio_avatar_shape = ${fields.link_bio_avatar_shape},
        link_bio_avatar_size = ${fields.link_bio_avatar_size},
        link_bio_avatar_border_width = ${fields.link_bio_avatar_border_width},
        link_bio_avatar_border_color = ${fields.link_bio_avatar_border_color},
        link_bio_avatar_shadow = ${fields.link_bio_avatar_shadow},
        link_bio_page_padding = ${fields.link_bio_page_padding},
        link_bio_section_gap = ${fields.link_bio_section_gap},
        link_bio_container_width = ${fields.link_bio_container_width},
        link_bio_bg_overlay = ${fields.link_bio_bg_overlay},
        link_bio_bg_overlay_opacity = ${fields.link_bio_bg_overlay_opacity},
        link_bio_glass_enabled = ${fields.link_bio_glass_enabled},
        link_bio_glass_intensity = ${fields.link_bio_glass_intensity},
        link_bio_intro_anim = ${fields.link_bio_intro_anim},
        link_bio_hover_effect = ${fields.link_bio_hover_effect},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      applied: {
        template: fields.link_bio_template,
        font: fields.link_bio_font,
        accent: fields.link_bio_accent,
      }
    });
  } catch (e: any) {
    console.error("[ai-designer/apply] Error:", e);
    return NextResponse.json({ error: "Failed to apply design" }, { status: 500 });
  }
}
