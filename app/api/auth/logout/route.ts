import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function POST() {
  const token = cookies().get("session_token")?.value;
  if (token) {
    const sql = getDb();
    await sql`DELETE FROM auth_sessions WHERE token = ${token}`.catch(() => {});
    cookies().delete("session_token");
  }
  return NextResponse.json({ success: true });
}
