import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGoogleAuthUrl } from "@/lib/google-auth";
import { checkIpRateLimit } from "@/lib/login-rate-limit";

export async function GET(request: Request) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  if (!checkIpRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || "creator";

  // Generate state with role info and CSRF protection
  const state = Buffer.from(
    JSON.stringify({ role, ts: Date.now() })
  ).toString("base64url");

  // Store state in cookie for validation
  cookies().set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 min
    path: "/",
  });

  const url = getGoogleAuthUrl(state);
  return NextResponse.redirect(url);
}
