import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateAutoProfile } from "@/lib/auto-profile";
import { generateTagReply } from "@/lib/bot-replies";

// Rate limit: 3 per IP per hour
const tagRateMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = tagRateMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < 60 * 60 * 1000);
  if (valid.length >= 3) return true;
  valid.push(now);
  tagRateMap.set(ip, valid);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
    }

    const body = await req.json();
    const { platform, handle, tagger_handle, source_url, post_id } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required." }, { status: 400 });
    }

    const validPlatforms = ["instagram", "tiktok", "x", "youtube"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
    }

    const db = getDb();

    // Log the tag event
    await db`
      INSERT INTO tag_events (platform, tagged_handle, tagger_handle, source_url, post_id, ip_address, status)
      VALUES (${platform}, ${handle}, ${tagger_handle || null}, ${source_url || null}, ${post_id || null}, ${ip}, 'pending')
    `;

    // Generate or fetch the auto profile
    const result = await generateAutoProfile(platform, handle, {
      referrerHandle: tagger_handle,
      sourcePostUrl: source_url,
    });

    // Generate the bot reply text
    const replyText = generateTagReply(
      result.profile.handle,
      result.slug,
      result.score.score,
      result.score.estimatedPostValue
    );

    // Update tag event status
    await db`
      UPDATE tag_events SET status = 'profile_created'
      WHERE tagged_handle = ${handle} AND platform = ${platform}
      AND status = 'pending'
      ORDER BY created_at DESC LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      profileUrl: result.profileUrl,
      slug: result.slug,
      score: result.score.score,
      estimatedPostValue: result.score.estimatedPostValue,
      replyText,
      isExisting: result.isExisting,
      isClaimed: result.isClaimed,
    });
  } catch (err) {
    console.error("Tag API error:", err);
    return NextResponse.json({ error: "Failed to process tag." }, { status: 500 });
  }
}
