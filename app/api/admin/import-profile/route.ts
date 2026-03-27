import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { generateAutoProfile } from "@/lib/auto-profile";
import crypto from "crypto";

const ADMIN_EMAILS = ["inpromptyou@gmail.com", "flinchify@gmail.com"];

async function getAdminUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.role FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  // Allow access if email is in admin list OR user role is admin
  if (!ADMIN_EMAILS.includes(rows[0].email as string) && rows[0].role !== "admin") return null;
  return rows[0];
}

// POST — Import a profile from a social platform, optionally assign to a user
export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { platform, handle, email } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required" }, { status: 400 });
    }

    const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");
    const sql = getDb();

    // Use generateAutoProfile which handles everything: scrape, score, design, create DB entry
    let autoProfile;
    try {
      autoProfile = await generateAutoProfile(platform, normalizedHandle);
    } catch (err: any) {
      return NextResponse.json({ error: "Failed to create profile: " + (err.message || "Unknown error") }, { status: 500 });
    }

    const design = autoProfile.design;

    let userId: string | null = null;
    let userCreated = false;

    // 4. If email provided OR createUser requested, create or find the user and link the profile
    const { createUser } = body;
    if (email || createUser) {
      if (email) {
        const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (existingUser.length > 0) {
          userId = existingUser[0].id as string;
        }
      }

      if (!userId) {
        // Create new user (email optional — use placeholder if not provided)
        let slug = normalizedHandle.replace(/[^a-z0-9]/gi, "").slice(0, 30);
        const slugExists = await sql`SELECT id FROM users WHERE slug = ${slug}`;
        if (slugExists.length > 0) slug = slug + Date.now().toString(36).slice(-4);

        const userEmail = email || `${normalizedHandle}@placeholder.hireacreator.ai`;
        const refCode = crypto.randomBytes(6).toString("hex");
        const result = await sql`
          INSERT INTO users (email, full_name, slug, avatar_url, bio, category, headline, role, referral_code,
            link_bio_template, link_bio_bg_type, link_bio_bg_value, link_bio_text_color, link_bio_font, link_bio_button_shape,
            visible_in_marketplace, is_verified, verification_method)
          VALUES (
            ${userEmail},
            ${autoProfile.profile.displayName || normalizedHandle},
            ${slug},
            ${autoProfile.profile.avatarUrl || null},
            ${autoProfile.profile.bio || null},
            ${autoProfile.profile.category || null},
            ${design.suggestedHeadline || null},
            'creator',
            ${refCode},
            ${design.template || null},
            ${design.bgType || null},
            ${design.bgValue || null},
            ${design.textColor || null},
            ${design.font || null},
            ${design.buttonShape || null},
            true,
            true,
            'admin'
          )
          RETURNING id
        `;
        userId = result[0].id as string;
        userCreated = true;

        // Add social connection
        await sql`
          INSERT INTO social_connections (user_id, platform, handle, url, follower_count, is_verified)
          VALUES (${userId}, ${platform}, ${normalizedHandle}, ${autoProfile.profile.profileUrl || ''}, ${autoProfile.profile.followerCount || 0}, false)
          ON CONFLICT DO NOTHING
        `;
      }

      // Link claimed_profile to user if not already claimed
      if (autoProfile && userId) {
        await sql`
          UPDATE claimed_profiles SET claimed_by = ${userId}, claimed_at = NOW()
          WHERE platform = ${platform} AND platform_handle = ${normalizedHandle}
          AND (claimed_by IS NULL OR claimed_by = ${userId})
        `;
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        slug: autoProfile.slug,
        platform,
        handle: normalizedHandle,
        displayName: autoProfile.profile.displayName,
        avatarUrl: autoProfile.profile.avatarUrl,
        followerCount: autoProfile.profile.followerCount,
        bio: autoProfile.profile.bio,
        score: autoProfile.score.score,
        design,
      },
      user: userId ? { id: userId, email, created: userCreated } : null,
      isExisting: autoProfile.isExisting,
      isClaimed: autoProfile.isClaimed,
    });
  } catch (err) {
    console.error("[admin/import-profile] error:", err);
    return NextResponse.json({ error: "Failed to import profile" }, { status: 500 });
  }
}
