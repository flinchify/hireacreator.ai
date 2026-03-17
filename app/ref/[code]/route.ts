import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /ref/[code] — redirect to homepage with referral cookie
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const sql = getDb();
  const users = await sql`SELECT id, referral_code FROM users WHERE referral_code = ${params.code}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai";

  if (users.length === 0) {
    // Invalid code — just redirect home
    return NextResponse.redirect(`${appUrl}/`);
  }

  // Set referral cookie (30-day window) and redirect to signup
  const response = NextResponse.redirect(`${appUrl}/?ref=${params.code}`);
  response.cookies.set("hca_ref", params.code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  return response;
}
