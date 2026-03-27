import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getAuthenticatedUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.is_verified, u.slug
    FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0] : null;
}

async function ensureColumns() {
  const sql = getDb();
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMPTZ`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_platform TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT FALSE`;
  } catch {
    // Columns may already exist
  }
}

// POST — Check if the user's social bio contains their HireACreator link
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await ensureColumns();

    const body = await req.json();
    const { platform, handle } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required" }, { status: 400 });
    }

    const slug = user.slug as string;
    if (!slug) {
      return NextResponse.json({ error: "You need a profile URL first. Set your username in your dashboard." }, { status: 400 });
    }

    const sql = getDb();
    const linkToFind = `hireacreator.ai/u/${slug}`.toLowerCase();
    const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");

    // For X/Twitter: try to fetch the public profile and check bio
    if (platform === "x" || platform === "twitter") {
      try {
        // Try fxtwitter API which provides public profile data
        const res = await fetch(`https://api.fxtwitter.com/${normalizedHandle}`, {
          headers: { "User-Agent": "HireACreator/1.0" },
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          const bio = (data?.user?.description || "").toLowerCase();

          if (bio.includes(linkToFind)) {
            // Verified! Update user
            await sql`
              UPDATE users SET
                is_verified = TRUE,
                verification_status = 'verified',
                verification_method = 'link_in_bio',
                verification_platform = ${platform},
                verification_checked_at = NOW(),
                pending_verification = FALSE,
                updated_at = NOW()
              WHERE id = ${user.id}
            `;

            return NextResponse.json({
              verified: true,
              pending: false,
              message: "Verified! Your HireACreator link was found in your X bio. You are now visible in the marketplace.",
            });
          } else {
            return NextResponse.json({
              verified: false,
              pending: false,
              message: `We couldn't find "hireacreator.ai/u/${slug}" in your X bio. Make sure you've saved it and try again.`,
            });
          }
        }
      } catch {
        // fxtwitter API failed, fall through to pending
      }

      // If auto-check failed, set pending
      await sql`
        UPDATE users SET
          pending_verification = TRUE,
          verification_platform = ${platform},
          verification_checked_at = NOW(),
          updated_at = NOW()
        WHERE id = ${user.id}
      `;

      return NextResponse.json({
        verified: false,
        pending: true,
        message: "We couldn't auto-check your X bio right now. Your verification is pending — an admin will confirm shortly.",
      });
    }

    // For Instagram, TikTok, YouTube: set pending (can't reliably scrape without API)
    await sql`
      UPDATE users SET
        pending_verification = TRUE,
        verification_platform = ${platform},
        verification_checked_at = NOW(),
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    const platformName = platform === "tiktok" ? "TikTok" : platform.charAt(0).toUpperCase() + platform.slice(1);

    return NextResponse.json({
      verified: false,
      pending: true,
      message: `Your ${platformName} verification is pending. We'll check your bio and verify you shortly. This usually takes less than 24 hours.`,
    });
  } catch (err) {
    console.error("[verification/check] error:", err);
    return NextResponse.json({ error: "Failed to check verification" }, { status: 500 });
  }
}
