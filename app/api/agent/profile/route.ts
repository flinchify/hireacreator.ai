import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "read");
    if (!auth.ok) return auth.response;

    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE id = ${auth.key.userId}`;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "profile_not_found", message: "No profile found for this API key owner." },
        { status: 404 }
      );
    }

    const user = users[0];
    const [socials, services] = await Promise.all([
      sql`SELECT id, platform, handle, url, follower_count, is_verified FROM social_connections WHERE user_id = ${user.id} ORDER BY created_at`,
      sql`SELECT id, title, description, price, currency, delivery_days, category, is_active FROM services WHERE user_id = ${user.id} ORDER BY created_at`,
    ]);

    return NextResponse.json({
      profile: {
        id: user.id,
        name: user.full_name,
        slug: user.slug,
        bio: user.bio,
        headline: user.headline,
        location: user.location,
        category: user.category,
        hourly_rate: user.hourly_rate,
        currency: user.currency,
        avatar_url: user.avatar_url,
        cover_url: user.cover_url,
        website_url: user.website_url,
        business_name: user.business_name,
        business_url: user.business_url,
        visible_in_marketplace: user.visible_in_marketplace,
        is_online: user.is_online,
        rating: Number(user.rating) || 0,
        review_count: user.review_count || 0,
        link_bio_template: user.link_bio_template,
        link_bio_accent: user.link_bio_accent,
        link_bio_font: user.link_bio_font,
        link_bio_text_color: user.link_bio_text_color,
        link_bio_bg_type: user.link_bio_bg_type,
        link_bio_bg_value: user.link_bio_bg_value,
        link_bio_button_shape: user.link_bio_button_shape,
        link_bio_button_anim: user.link_bio_button_anim,
        link_bio_card_style: user.link_bio_card_style,
        link_bio_intro_anim: user.link_bio_intro_anim,
        public_url: user.slug ? `https://hireacreator.ai/${user.slug}` : null,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      socials,
      services,
    });
  } catch (err: any) {
    console.error("[Agent Profile GET Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "write");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const { name, slug, bio, category, template, avatar_url, cover_url, website } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "missing_fields", message: "name and slug are required." },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check if agent already has a profile set up
    const existing = await sql`SELECT id, slug FROM users WHERE id = ${auth.key.userId}`;
    if (existing.length > 0 && existing[0].slug) {
      return NextResponse.json(
        { error: "profile_exists", message: "You already have a profile. Use PATCH to update it." },
        { status: 409 }
      );
    }

    // Validate slug
    const slugStr = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);
    const slugTaken = await sql`SELECT id FROM users WHERE slug = ${slugStr} AND id != ${auth.key.userId}`;
    if (slugTaken.length > 0) {
      return NextResponse.json(
        { error: "slug_taken", message: "This username/slug is already taken." },
        { status: 400 }
      );
    }

    // Update the user record with profile data
    await sql`
      UPDATE users SET
        full_name = ${name},
        slug = ${slugStr},
        bio = ${bio || null},
        category = ${category || null},
        link_bio_template = ${template || 'minimal'},
        avatar_url = ${avatar_url || null},
        cover_url = ${cover_url || null},
        website_url = ${website || null},
        visible_in_marketplace = TRUE,
        onboarding_complete = TRUE,
        updated_at = NOW()
      WHERE id = ${auth.key.userId}
    `;

    return NextResponse.json({
      success: true,
      profile: {
        id: auth.key.userId,
        name,
        slug: slugStr,
        bio: bio || null,
        category: category || null,
        template: template || "minimal",
        avatar_url: avatar_url || null,
        cover_url: cover_url || null,
        website_url: website || null,
        public_url: `https://hireacreator.ai/${slugStr}`,
      },
      message: "Profile created. Your link-in-bio is now live.",
    }, { status: 201 });
  } catch (err: any) {
    console.error("[Agent Profile POST Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to create profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "write");
    if (!auth.ok) return auth.response;

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "invalid_body", message: "Request body must be valid JSON." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE id = ${auth.key.userId}`;
    if (users.length === 0) {
      return NextResponse.json(
        { error: "profile_not_found", message: "No profile found for this API key owner." },
        { status: 404 }
      );
    }
    const user = users[0];

    // Validate slug uniqueness if changing
    if (body.slug) {
      const slugStr = String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);
      const existing = await sql`SELECT id FROM users WHERE slug = ${slugStr} AND id != ${auth.key.userId}`;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "slug_taken", message: "This username/slug is already taken." },
          { status: 400 }
        );
      }
      body.slug = slugStr;
    }

    await sql`
      UPDATE users SET
        full_name = COALESCE(${body.name ?? body.full_name ?? null}, full_name),
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
        link_bio_font = COALESCE(${body.link_bio_font ?? null}, link_bio_font),
        link_bio_text_color = ${body.link_bio_text_color !== undefined ? body.link_bio_text_color : user.link_bio_text_color},
        link_bio_bg_images = ${body.link_bio_bg_images !== undefined ? body.link_bio_bg_images : user.link_bio_bg_images},
        link_bio_intro_anim = COALESCE(${body.link_bio_intro_anim ?? null}, link_bio_intro_anim),
        link_bio_card_style = COALESCE(${body.link_bio_card_style ?? null}, link_bio_card_style),
        updated_at = NOW()
      WHERE id = ${auth.key.userId}
    `;

    // Return updated profile
    const updated = await sql`SELECT * FROM users WHERE id = ${auth.key.userId}`;
    const u = updated[0];

    return NextResponse.json({
      success: true,
      profile: {
        id: u.id,
        name: u.full_name,
        slug: u.slug,
        bio: u.bio,
        headline: u.headline,
        location: u.location,
        category: u.category,
        avatar_url: u.avatar_url,
        cover_url: u.cover_url,
        website_url: u.website_url,
        visible_in_marketplace: u.visible_in_marketplace,
        link_bio_template: u.link_bio_template,
        public_url: u.slug ? `https://hireacreator.ai/${u.slug}` : null,
        updated_at: u.updated_at,
      },
    });
  } catch (err: any) {
    console.error("[Agent Profile PATCH Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
