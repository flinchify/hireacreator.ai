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
    const { slug, platform, handle, verified } = body;

    // Find the profile by slug, or by platform+handle
    let profile;
    if (slug) {
      const rows = await db`
        SELECT id, claimed_by, platform, platform_handle FROM claimed_profiles
        WHERE auto_profile_slug = ${slug}
        LIMIT 1
      `;
      profile = rows[0];
    } else if (platform && handle) {
      const rows = await db`
        SELECT id, claimed_by, platform, platform_handle FROM claimed_profiles
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

    // If not passing verified=true, return platform info for verification
    // The client must complete bio verification before actually claiming
    if (!verified) {
      return NextResponse.json({
        needs_verification: true,
        platform: profile.platform,
        handle: profile.platform_handle,
        profile_id: profile.id,
      });
    }

    // verified=true — check that the user actually verified this social account
    const profilePlatform = platform || profile.platform;
    const profileHandle = (handle || profile.platform_handle || "").toLowerCase().replace(/^@/, "");

    const verificationRows = await db`
      SELECT id FROM verification_codes
      WHERE user_id = ${userId}
      AND platform = ${profilePlatform}
      AND handle = ${profileHandle}
      AND verified_at IS NOT NULL
      ORDER BY verified_at DESC
      LIMIT 1
    `;

    if (verificationRows.length === 0) {
      return NextResponse.json({
        error: "You must verify ownership of this social account before claiming.",
        needs_verification: true,
        platform: profilePlatform,
        handle: profileHandle,
      }, { status: 403 });
    }

    // Verification confirmed — actually claim the profile
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
