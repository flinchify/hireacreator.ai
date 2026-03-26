import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { fetchSocialProfile } from "@/lib/social-scraper";

async function getAuthenticatedUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.is_verified
    FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0] : null;
}

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "hac-";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// POST — Generate a verification code
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, handle } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required" }, { status: 400 });
    }

    const validPlatforms = ["instagram", "x"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Bio verification is only supported for Instagram and X" }, { status: 400 });
    }

    const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");
    const sql = getDb();

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        platform TEXT NOT NULL,
        handle TEXT NOT NULL,
        code TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
        verified_at TIMESTAMPTZ
      )
    `;

    // Check for existing unexpired code for this user + platform + handle
    const existing = await sql`
      SELECT id, code, expires_at FROM verification_codes
      WHERE user_id = ${user.id}
      AND platform = ${platform}
      AND handle = ${normalizedHandle}
      AND verified_at IS NULL
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({
        code: existing[0].code,
        expires_at: existing[0].expires_at,
        instructions: `Add this code to your ${platform} bio: ${existing[0].code}`,
      });
    }

    // Generate new code
    const code = generateCode();
    const result = await sql`
      INSERT INTO verification_codes (user_id, platform, handle, code)
      VALUES (${user.id}, ${platform}, ${normalizedHandle}, ${code})
      RETURNING code, expires_at
    `;

    return NextResponse.json({
      code: result[0].code,
      expires_at: result[0].expires_at,
      instructions: `Add this code to your ${platform} bio: ${code}`,
    });
  } catch (err) {
    console.error("Generate verification code error:", err);
    return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 });
  }
}

// PUT — Check if the code is in the user's bio
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { platform, handle, code } = body;

    if (!platform || !handle || !code) {
      return NextResponse.json({ error: "Platform, handle, and code are required" }, { status: 400 });
    }

    const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");
    const sql = getDb();

    // Verify the code exists and belongs to this user
    const codeRows = await sql`
      SELECT id FROM verification_codes
      WHERE user_id = ${user.id}
      AND platform = ${platform}
      AND handle = ${normalizedHandle}
      AND code = ${code}
      AND verified_at IS NULL
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (codeRows.length === 0) {
      return NextResponse.json({
        verified: false,
        message: "Verification code not found or expired. Please generate a new one.",
      });
    }

    // Scrape the user's bio — try multiple methods
    let bio: string | null = null;

    try {
      const profile = await fetchSocialProfile(platform, normalizedHandle);
      if (profile) {
        bio = profile.bio;
      }
    } catch (err) {
      console.error(`Failed to scrape ${platform} bio for @${normalizedHandle}:`, err);
    }

    // If user provided their bio text as a fallback (for private accounts)
    if (!bio && body.bioText) {
      bio = body.bioText;
    }

    if (!bio) {
      return NextResponse.json({
        verified: false,
        needsBioText: true,
        message: `We couldn't read your ${platform} bio automatically. This can happen with private or personal accounts. Please paste your bio text below so we can check for the code.`,
      });
    }

    // Check if the code is in the bio
    if (!bio.includes(code)) {
      return NextResponse.json({
        verified: false,
        message: `Code not found in your ${platform} bio. Make sure you saved it and try again. It may take a moment for changes to appear.`,
      });
    }

    // Code found — mark as verified
    await sql`
      UPDATE verification_codes
      SET verified_at = NOW()
      WHERE user_id = ${user.id}
      AND platform = ${platform}
      AND handle = ${normalizedHandle}
      AND code = ${code}
    `;

    // Update user verification status
    await sql`
      UPDATE users SET is_verified = true, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Update social_connections verification
    await sql`
      UPDATE social_connections SET is_verified = true
      WHERE user_id = ${user.id}
      AND platform = ${platform}
      AND LOWER(handle) = ${normalizedHandle}
    `;

    return NextResponse.json({
      verified: true,
      message: "Account verified! You can now remove the code from your bio.",
    });
  } catch (err) {
    console.error("Verify social bio error:", err);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
