import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { platform, handle } = await req.json();
  if (!platform || !handle) {
    return NextResponse.json({ error: "platform and handle required" }, { status: 400 });
  }

  const sql = getDb();
  const clean = handle.replace(/^@/, "").trim().toLowerCase();
  
  const result = await sql`
    DELETE FROM claimed_profiles 
    WHERE platform = ${platform} AND platform_handle = ${clean}
    RETURNING id
  `;

  return NextResponse.json({ deleted: result.length, handle: clean });
}
