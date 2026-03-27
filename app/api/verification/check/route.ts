import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.slug FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const sql = getDb();

    // Check if manual review was requested
    let manual = false;
    try {
      const body = await request.json();
      manual = !!body?.manual;
    } catch {
      // No body or invalid JSON — that's fine
    }

    // Get user's primary social connection
    const socials = await sql`
      SELECT platform, handle FROM social_connections
      WHERE user_id = ${user.id}
      ORDER BY created_at
      LIMIT 1
    `;

    if (socials.length === 0) {
      return NextResponse.json({
        verified: false,
        pending: false,
        message: "No social account connected. Add one first.",
      });
    }

    const { platform, handle } = socials[0];

    // If manual submission or non-scrapable platform, set to pending
    if (manual || !["x", "twitter"].includes(platform)) {
      await sql`
        UPDATE users
        SET verification_method = 'pending',
            verification_checked_at = NOW(),
            verification_platform = ${platform}
        WHERE id = ${user.id}
      `;
      return NextResponse.json({
        verified: false,
        pending: true,
        message: "Verification submitted for manual review.",
      });
    }

    // For X/Twitter: try to check if "hireacreator" appears in their profile
    try {
      const res = await fetch(`https://x.com/${handle}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });
      const text = await res.text();

      if (text.toLowerCase().includes("hireacreator")) {
        await sql`
          UPDATE users
          SET is_verified = true,
              verification_method = 'link_in_bio',
              verification_checked_at = NOW(),
              verification_platform = ${platform}
          WHERE id = ${user.id}
        `;
        return NextResponse.json({
          verified: true,
          pending: false,
          message: "Verified! Your HireACreator link was found in your bio.",
        });
      }
    } catch {
      // Fetch failed — fall through to pending
    }

    // X scrape didn't find it — set pending for manual review
    await sql`
      UPDATE users
      SET verification_method = 'pending',
          verification_checked_at = NOW(),
          verification_platform = ${platform}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      verified: false,
      pending: false,
      message: "Link not found in your bio yet. Make sure your bio contains 'hireacreator' and try again.",
    });
  } catch (e: any) {
    console.error("[verification/check]", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
