import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { claimProfile } from "@/lib/auto-profile";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const db = getDb();
    const sessions = await db`
      SELECT user_id FROM auth_sessions
      WHERE token = ${sessionToken} AND expires_at > NOW()
      LIMIT 1
    `;
    if (sessions.length === 0) {
      return NextResponse.json({ error: "Session expired." }, { status: 401 });
    }
    const userId = sessions[0].user_id as string;

    const body = await req.json();
    const { slug, platform, handle } = body;

    // Find the claimed profile by slug, or by platform+handle
    let profile;
    if (slug) {
      const rows = await db`
        SELECT id, claimed_by FROM claimed_profiles
        WHERE auto_profile_slug = ${slug}
        LIMIT 1
      `;
      profile = rows[0];
    } else if (platform && handle) {
      const rows = await db`
        SELECT id, claimed_by FROM claimed_profiles
        WHERE platform = ${platform} AND platform_handle = ${handle.toLowerCase().replace(/^@/, "")}
        LIMIT 1
      `;
      profile = rows[0];
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    if (profile.claimed_by && profile.claimed_by !== userId) {
      return NextResponse.json({ error: "Profile already claimed." }, { status: 400 });
    }

    const success = await claimProfile(profile.id as string, userId);
    if (!success) {
      return NextResponse.json({ error: "Could not claim profile." }, { status: 400 });
    }

    // Link pending offers
    let pendingOfferCount = 0;
    try {
      const connections = await db`
        SELECT platform, handle FROM social_connections WHERE user_id = ${userId}
      `;
      for (const sc of connections) {
        const updated = await db`
          UPDATE offers
          SET creator_user_id = ${userId}, verified_at = NOW(), updated_at = NOW()
          WHERE creator_platform = ${sc.platform}
          AND LOWER(creator_handle) = LOWER(${sc.handle})
          AND creator_user_id IS NULL
          RETURNING id
        `;
        pendingOfferCount += updated.length;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      pending_offers: pendingOfferCount,
    });
  } catch (err) {
    console.error("[claim-link] error:", err);
    return NextResponse.json({ error: "Failed to claim profile." }, { status: 500 });
  }
}
