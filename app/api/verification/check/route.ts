import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function ensureColumns() {
  const sql = getDb();
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_checked_at TIMESTAMPTZ`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_platform TEXT`;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT FALSE`;
}

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.slug FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows.length > 0 ? rows[0] : null;
}

export async function POST(request: Request) {
  try {
    await ensureColumns();

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await request.json();
    const { platform, handle } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "platform and handle are required" }, { status: 400 });
    }

    const sql = getDb();
    const slug = user.slug as string;
    const normalizedHandle = (handle as string).toLowerCase().trim().replace(/^@/, "");

    // For X/Twitter: attempt automatic check via fxtwitter API
    if (["x", "twitter"].includes(platform)) {
      try {
        const res = await fetch(`https://api.fxtwitter.com/${normalizedHandle}`, {
          headers: { "User-Agent": "HireACreator/1.0" },
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          const data = await res.json();
          const bio = (data?.user?.description || data?.user?.bio || "").toLowerCase();

          if (bio.includes(`hireacreator.ai/u/${slug.toLowerCase()}`)) {
            await sql`
              UPDATE users
              SET is_verified = true,
                  verification_method = 'link_in_bio',
                  verification_platform = ${platform},
                  verification_checked_at = NOW(),
                  pending_verification = false
              WHERE id = ${user.id}
            `;
            return NextResponse.json({
              verified: true,
              pending: false,
              message: "Verified! Your HireACreator link was found in your bio.",
            });
          }
        }
      } catch {
        // Fetch failed — fall through to pending
      }

      // Not found — set pending for manual review
      await sql`
        UPDATE users
        SET pending_verification = true,
            verification_platform = ${platform},
            verification_checked_at = NOW()
        WHERE id = ${user.id}
      `;
      return NextResponse.json({
        verified: false,
        pending: true,
        message: "We couldn't find the link yet. Your profile has been submitted for manual review.",
      });
    }

    // For Instagram/TikTok/YouTube: set pending for manual review
    await sql`
      UPDATE users
      SET pending_verification = true,
          verification_platform = ${platform},
          verification_checked_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      verified: false,
      pending: true,
      message: `We can't auto-check ${platform} bios yet. Your profile has been submitted for manual review.`,
    });
  } catch (e) {
    console.error("[verification/check]", e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
