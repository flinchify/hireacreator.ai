import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { claimProfile } from "@/lib/auto-profile";
import { ipRateLimit, getClientIp } from "@/lib/ip-rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = ipRateLimit(`claim:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // Check auth via session_token cookie
    const sessionToken = req.cookies.get("session_token")?.value;
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const db = getDb();
    const sessions = await db`
      SELECT user_id FROM auth_sessions
      WHERE token = ${sessionToken} AND expires_at > NOW()
      LIMIT 1
    `;
    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    const userId = sessions[0].user_id as string;

    const body = await req.json();
    const { claimedProfileId } = body;
    if (!claimedProfileId || typeof claimedProfileId !== "string") {
      return NextResponse.json(
        { error: "claimedProfileId is required." },
        { status: 400 }
      );
    }

    const success = await claimProfile(claimedProfileId, userId);
    if (!success) {
      return NextResponse.json(
        { error: "Could not claim this profile. It may not exist or is already claimed by another user." },
        { status: 400 }
      );
    }

    // Link any pending offers to this creator
    let pendingOfferCount = 0;
    try {
      // Get all social connections for this user to match offers
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
    } catch (e) {
      console.error("[Claim] Error linking offers:", e);
    }

    // Get the user's slug for redirect
    const users = await db`
      SELECT slug FROM users WHERE id = ${userId} LIMIT 1
    `;
    const slug = users[0]?.slug || userId;

    return NextResponse.json({
      success: true,
      redirectUrl: `/u/${slug}`,
      pending_offers: pendingOfferCount,
      message: pendingOfferCount > 0 ? `You have ${pendingOfferCount} offer${pendingOfferCount > 1 ? 's' : ''} waiting!` : undefined,
      needs_verification: true,
      verification_message: "Verify your social account from your dashboard to accept offers and get a verified badge.",
    });
  } catch (err) {
    console.error("Claim API error:", err);
    return NextResponse.json(
      { error: "Failed to claim profile." },
      { status: 500 }
    );
  }
}
