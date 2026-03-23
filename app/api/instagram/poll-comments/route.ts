import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * GET /api/instagram/poll-comments
 * Polls @hireacreatorai's recent posts for comments containing @hireacreator
 * and auto-replies. Works in dev mode without webhooks.
 */
export async function GET() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "No Instagram token" }, { status: 500 });
  }

  const results: any[] = [];

  try {
    // 1. Get our recent media
    const mediaRes = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,timestamp&limit=5&access_token=${accessToken}`
    );
    const mediaData = await mediaRes.json();
    
    if (!mediaData.data || mediaData.data.length === 0) {
      return NextResponse.json({ message: "No posts found on @hireacreatorai. Post something first.", posts: 0 });
    }

    // 2. For each post, get comments
    for (const post of mediaData.data) {
      const commentsRes = await fetch(
        `https://graph.instagram.com/v21.0/${post.id}/comments?fields=id,text,username,timestamp&access_token=${accessToken}`
      );
      const commentsData = await commentsRes.json();

      if (!commentsData.data) continue;

      for (const comment of commentsData.data) {
        const text = (comment.text || "").toLowerCase();
        
        // Check if comment mentions hireacreator
        if (text.includes("@hireacreator") || text.includes("hireacreator")) {
          const username = comment.username;
          
          // Try to reply
          const replyText = `Hey @${username}! 👋 We just built your creator profile on HireACreator. Claim it free: hireacreator.ai/claim?platform=instagram&handle=${username}`;
          
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
        ? "No comments mentioning @hireacreator found. Comment '@hireacreatorai' on one of your posts first."
        : `Processed ${results.length} comment(s).`,
    });
  } catch (e: any) {
    console.error("[Poll Comments] Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
