import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export const maxDuration = 30;

/**
 * GET /api/instagram/test-reply
 * Reads latest comments and tries to reply to the newest @hireacreator mention.
 * Requires authenticated admin user.
 */
export async function GET() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const rows = await db`SELECT role FROM users WHERE session_token = ${token} LIMIT 1`;
  if (!rows.length || rows[0].role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) return NextResponse.json({ error: "No token" });

  const results: any = { steps: [] };

  try {
    // Step 1: Get media
    const mediaRes = await fetch(
      `https://graph.instagram.com/v25.0/me/media?fields=id,caption,timestamp,comments_count&limit=5&access_token=${accessToken}`
    );
    const mediaData = await mediaRes.json();
    results.steps.push({ step: "get_media", status: mediaRes.status, posts: mediaData.data?.length || 0 });

    if (!mediaData.data?.length) return NextResponse.json(results);

    const postId = mediaData.data[0].id;

    // Step 2: Get comments
    const commentsRes = await fetch(
      `https://graph.instagram.com/v25.0/${postId}/comments?fields=id,text,username,timestamp&limit=50&access_token=${accessToken}`
    );
    const commentsData = await commentsRes.json();
    results.steps.push({ step: "get_comments", status: commentsRes.status, count: commentsData.data?.length || 0 });
    results.comments = commentsData.data?.slice(0, 5); // Show first 5

    // Step 3: Find newest mention that's not from us
    const mention = commentsData.data?.find((c: any) => {
      const text = (c.text || "").toLowerCase();
      const user = (c.username || "").toLowerCase();
      return user !== "hireacreatorai" && (text.includes("@hireacreator") || text.includes("hireacreator"));
    });

    if (!mention) {
      results.steps.push({ step: "find_mention", found: false, note: "No mentions from non-hireacreatorai users" });
      return NextResponse.json(results);
    }

    results.steps.push({ step: "find_mention", found: true, comment_id: mention.id, from: mention.username, text: mention.text });

    // Step 4: Reply
    const replyText = `Hey @${mention.username}! We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=instagram&handle=${mention.username}`;
    
    const replyRes = await fetch(
      `https://graph.instagram.com/v25.0/${mention.id}/replies`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText, access_token: accessToken }),
      }
    );
    const replyData = await replyRes.json();
    results.steps.push({ step: "reply", status: replyRes.status, data: replyData });

    return NextResponse.json(results);
  } catch (e: any) {
    results.error = e.message;
    return NextResponse.json(results);
  }
}
