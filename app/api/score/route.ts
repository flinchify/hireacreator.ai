import { NextRequest, NextResponse } from "next/server";
import { generateAutoProfile } from "@/lib/auto-profile";

// Simple in-memory rate limiter
const rateMap = new Map<string, number[]>();

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = rateMap.get(ip) || [];
  const valid = timestamps.filter((t) => now - t < windowMs);
  if (valid.length >= limit) return true;
  valid.push(now);
  rateMap.set(ip, valid);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

    // 10 requests per 15 minutes
    if (isRateLimited(ip, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in a few minutes." }, { status: 429 });
    }

    const body = await req.json();
    const { platform, handle, manual } = body;

    if (!platform || !handle) {
      return NextResponse.json({ error: "Platform and handle are required." }, { status: 400 });
    }

    const validPlatforms = ["instagram", "tiktok", "x", "youtube"];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
    }

    const cleanHandle = handle.replace(/^@/, "").trim();
    if (!cleanHandle || cleanHandle.length > 100) {
      return NextResponse.json({ error: "Invalid handle." }, { status: 400 });
    }

    const result = await generateAutoProfile(platform, cleanHandle, {
      manualData: manual || undefined,
    });

    return NextResponse.json({
      score: result.score.score,
      breakdown: result.score.breakdown,
      estimatedPostValue: result.score.estimatedPostValue,
      estimatedPostRange: result.score.estimatedPostRange,
      detectedNiche: result.score.detectedNiche,
      matchingCampaigns: result.score.matchingCampaigns,
      profile: {
        displayName: result.profile.displayName,
        avatarUrl: result.profile.avatarUrl,
        bio: result.profile.bio,
        followerCount: result.profile.followerCount,
        platform: result.profile.platform,
        handle: result.profile.handle,
      },
      slug: result.slug,
      profileUrl: result.profileUrl,
      isExisting: result.isExisting,
      isClaimed: result.isClaimed,
      manualInputRequired: !result.profile.avatarUrl && !result.profile.bio && result.profile.followerCount === 0,
    });
  } catch (err) {
    console.error("Score API error:", err);
    return NextResponse.json({ error: "Failed to generate score." }, { status: 500 });
  }
}
