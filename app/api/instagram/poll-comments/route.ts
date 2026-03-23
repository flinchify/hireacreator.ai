import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const maxDuration = 30;

/**
 * GET /api/instagram/poll-comments
 * Polls @hireacreatorai's recent posts for comments containing @hireacreator
 * and auto-replies. Works in dev mode without webhooks.
 * Tracks replied comments in DB to avoid double-replies.
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent abuse
  const cronSecret = process.env.CRON_SECRET || process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "No Instagram token" }, { status: 500 });
  }

  const sql = getDb();
  const results: any[] = [];

  try {
    // Ensure tracking table exists
    await sql`
      CREATE TABLE IF NOT EXISTS ig_replied_comments (
        comment_id TEXT PRIMARY KEY,
        username TEXT,
        replied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `.catch(() => {});

    // 1. Get our recent media
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,timestamp&limit=10&access_token=${accessToken}`
    );
    const mediaData = await mediaRes.json();
    
    if (!mediaData.data || mediaData.data.length === 0) {
      return NextResponse.json({ message: "No posts found. Post something on @hireacreatorai first.", posts: 0 });
    }

    // 2. For each post, get comments
    for (const post of mediaData.data) {
      const commentsRes = await fetch(
        `https://graph.instagram.com/v21.0/${post.id}/comments?fields=id,text,username,timestamp&limit=50&access_token=${accessToken}`
      );
      const commentsData = await commentsRes.json();
      if (!commentsData.data) continue;

      for (const comment of commentsData.data) {
        const text = (comment.text || "").toLowerCase();
        const commentUsername = (comment.username || "").toLowerCase();
        
        // Skip our own comments
        if (commentUsername === "hireacreatorai") continue;
        
        // Skip comments that don't mention us
        if (!text.includes("@hireacreator") && !text.includes("hireacreator")) continue;
        
        // Skip if no username (can't build a profile without it)
        if (!comment.username) continue;

        {
          // Check if we already replied
          const existing = await sql`
            SELECT comment_id FROM ig_replied_comments WHERE comment_id = ${comment.id}
          `.catch(() => []);
          
          if (existing && existing.length > 0) continue; // Already replied

          const username = comment.username;
          const replyText = `Hey @${username}! We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=instagram&handle=${username}`;
          
          try {
            const replyRes = await fetch(
              `https://graph.instagram.com/v21.0/${comment.id}/replies`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: replyText,
                  access_token: accessToken,
                }),
              }
            );
            const replyData = await replyRes.json();
            
            // Track the reply
            if (replyRes.ok) {
              await sql`
                INSERT INTO ig_replied_comments (comment_id, username) VALUES (${comment.id}, ${username})
              `.catch(() => {});
            }

            // Also auto-build their profile
            if (replyRes.ok) {
              fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/api/score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ platform: "instagram", handle: username }),
              }).catch(() => {});
            }

            results.push({
              comment_id: comment.id,
              from: username,
              text: comment.text,
              reply_status: replyRes.ok ? "replied" : "failed",
              reply_data: replyData,
            });
          } catch (e: any) {
            results.push({
              comment_id: comment.id,
              from: username,
              text: comment.text,
              reply_status: "error",
              error: e.message,
            });
          }
        }
      }
    }

    return NextResponse.json({
      posts_checked: mediaData.data.length,
      replies: results,
      message: results.length === 0 
        ? "No new comments mentioning @hireacreator found."
        : `Replied to ${results.length} comment(s).`,
    });
  } catch (e: any) {
    console.error("[Poll Comments] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
