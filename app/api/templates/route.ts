import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

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

// GET /api/templates — list public community templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";
    const sql = getDb();

    if (mine) {
      const user = await getUser();
      if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      const templates = await sql`
        SELECT ct.*, u.full_name as creator_name, u.slug as creator_slug
        FROM community_templates ct JOIN users u ON u.id = ct.creator_id
        WHERE ct.creator_id = ${user.id}
        ORDER BY ct.created_at DESC
      `;
      return NextResponse.json({ templates });
    }

    const templates = await sql`
      SELECT ct.id, ct.name, ct.slug, ct.description, ct.preview_url, ct.settings, ct.use_count, ct.likes, ct.created_at,
             u.full_name as creator_name, u.slug as creator_slug, u.avatar_url as creator_avatar
      FROM community_templates ct JOIN users u ON u.id = ct.creator_id
      WHERE ct.is_public = true
      ORDER BY ct.likes DESC, ct.use_count DESC
      LIMIT 50
    `;
    return NextResponse.json({ templates });
  } catch (e: any) {
    console.error("Templates GET error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/templates — save current settings as a community template
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const { name, description, isPublic } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    // Capture current user's link-in-bio settings as the template
    const settings = {
      template: user.link_bio_template || "minimal",
      accent: user.link_bio_accent || "#171717",
      font: user.link_bio_font || "jakarta",
      textColor: user.link_bio_text_color || "",
      bgType: user.link_bio_bg_type || "",
      bgValue: user.link_bio_bg_value || "",
      bgVideo: user.link_bio_bg_video || "",
      bgImages: user.link_bio_bg_images || "",
      buttonShape: user.link_bio_button_shape || "rounded",
      buttonAnim: user.link_bio_button_anim || "none",
      cardStyle: user.link_bio_card_style || "default",
    };

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
    const sql = getDb();

    const existing = await sql`SELECT id FROM community_templates WHERE slug = ${slug}`;
    const finalSlug = existing.length > 0 ? `${slug}-${Date.now().toString(36).slice(-4)}` : slug;

    const result = await sql`
      INSERT INTO community_templates (creator_id, name, slug, description, settings, is_public)
      VALUES (${user.id}, ${name.trim()}, ${finalSlug}, ${description?.trim() || null}, ${JSON.stringify(settings)}, ${isPublic !== false})
      RETURNING *
    `;

    return NextResponse.json({ template: result[0] });
  } catch (e: any) {
    console.error("Templates POST error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// PATCH /api/templates — apply a community template to your profile
export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const { templateId } = body;

    if (!templateId) return NextResponse.json({ error: "templateId required" }, { status: 400 });

    const sql = getDb();
    const rows = await sql`SELECT * FROM community_templates WHERE id = ${templateId}`;
    if (rows.length === 0) return NextResponse.json({ error: "Template not found" }, { status: 404 });

    const s = rows[0].settings as any;
    await sql`
      UPDATE users SET
        link_bio_template = ${s.template || "custom"},
        link_bio_accent = ${s.accent || "#171717"},
        link_bio_font = ${s.font || "jakarta"},
        link_bio_text_color = ${s.textColor || ""},
        link_bio_bg_type = ${s.bgType || ""},
        link_bio_bg_value = ${s.bgValue || ""},
        link_bio_bg_video = ${s.bgVideo || ""},
        link_bio_bg_images = ${s.bgImages || ""},
        link_bio_button_shape = ${s.buttonShape || "rounded"},
        link_bio_button_anim = ${s.buttonAnim || "none"},
        link_bio_card_style = ${s.cardStyle || "default"},
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Increment use count
    await sql`UPDATE community_templates SET use_count = use_count + 1 WHERE id = ${templateId}`;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Templates PATCH error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// DELETE /api/templates — delete your own template
export async function DELETE(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const sql = getDb();
    await sql`DELETE FROM community_templates WHERE id = ${id} AND creator_id = ${user.id}`;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Templates DELETE error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
