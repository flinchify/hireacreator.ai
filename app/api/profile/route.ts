import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
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
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sql = getDb();
  const [socials, services, portfolio] = await Promise.all([
    sql`SELECT * FROM social_connections WHERE user_id = ${user.id} ORDER BY created_at`,
    sql`SELECT * FROM services WHERE user_id = ${user.id} ORDER BY created_at`,
    sql`SELECT * FROM portfolio_items WHERE user_id = ${user.id} ORDER BY sort_order`,
  ]);

  return NextResponse.json({ user, socials, services, portfolio });
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const sql = getDb();

  // Validate slug uniqueness if changing
  if (body.slug) {
    const slugStr = String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);
    const existing = await sql`SELECT id FROM users WHERE slug = ${slugStr} AND id != ${user.id}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "slug_taken", message: "This username is already taken." }, { status: 400 });
    }
    body.slug = slugStr;
  }

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
      updated_at = NOW()
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ success: true });
}
