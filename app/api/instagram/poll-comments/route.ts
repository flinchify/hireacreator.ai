import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateSmartReply, parseOfferFromText, generateOfferReply } from "@/lib/bot-replies";

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
    // Check if Instagram bot is enabled in site_settings
    const botSetting = await sql`SELECT value FROM site_settings WHERE key = 'ig_bot_enabled'`.catch(() => []);
    if (botSetting.length > 0 && botSetting[0].value === "false") {
      return NextResponse.json({ message: "Instagram bot is disabled", paused: true });
    }

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

          // Determine the creator handle (other @mention, or commenter if self-promo)
          const username = comment.username;
          const commentMentions = (comment.text || "").match(/@([\w.]+)/g) || [];
          const igOtherMentions = commentMentions
            .map((m: string) => m.slice(1).toLowerCase())
            .filter((h: string) => !h.startsWith("hireacreator") && h !== commentUsername);
          const creatorHandle = igOtherMentions.length > 0 ? igOtherMentions[0] : commentUsername;

          // Check if the creator has social offers disabled
          const creatorCheck = await sql`
            SELECT u.social_offers_enabled FROM users u
            JOIN social_connections sc ON sc.user_id = u.id
            WHERE sc.platform = 'instagram' AND LOWER(sc.handle) = LOWER(${creatorHandle})
            LIMIT 1
          `.catch(() => []);
          if (creatorCheck.length > 0 && creatorCheck[0].social_offers_enabled === false) continue;

          // Rate limit by CREATOR: max 1 reply per creator handle per 24h
          const existingProfile = await sql`
            SELECT 1 FROM claimed_profiles
            WHERE platform = 'instagram' AND platform_handle = ${creatorHandle}
          `.catch(() => []);
          const recentReplies = await sql`
            SELECT COUNT(*) as cnt FROM ig_replied_comments
            WHERE username = ${creatorHandle} AND replied_at > NOW() - INTERVAL '24 hours'
          `.catch(() => [{ cnt: 0 }]);
          const replyCount = Number(recentReplies[0]?.cnt || 0);
          if (existingProfile.length > 0 && replyCount >= 1) continue;
          // Check for offer in comment text
          const parsed = parseOfferFromText(comment.text);
          let replyText: string;
          let offerCreated = false;

          if (parsed.hasOffer && parsed.creatorHandle) {
            try {
              // Ensure brand tracking columns exist
              await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS brand_platform TEXT`.catch(() => {});
              await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS brand_handle TEXT`.catch(() => {});
              await sql`ALTER TABLE offers ALTER COLUMN brand_user_id DROP NOT NULL`.catch(() => {});

              let brandUserId: string | null = null;
              const brandRows = await sql`
                SELECT u.id FROM users u
                JOIN social_connections sc ON sc.user_id = u.id
                WHERE sc.platform = 'instagram' AND LOWER(sc.handle) = LOWER(${username})
                LIMIT 1
              `.catch(() => []);
              if (brandRows.length > 0) brandUserId = brandRows[0].id;

              let creatorUserId: string | null = null;
              const creatorRows = await sql`
                SELECT u.id FROM users u
                JOIN social_connections sc ON sc.user_id = u.id
                WHERE sc.platform = 'instagram' AND LOWER(sc.handle) = LOWER(${parsed.creatorHandle})
                LIMIT 1
              `.catch(() => []);
              if (creatorRows.length > 0) creatorUserId = creatorRows[0].id;

              const budgetCents = Math.round(parsed.budget! * 100);
              const feeCents = Math.round(budgetCents * 0.15);

              // Always create offer - even if brand not signed up yet
              await sql`
                INSERT INTO offers (
                  brand_user_id, brand_platform, brand_handle,
                  creator_handle, creator_platform, creator_user_id,
                  budget_cents, fee_cents, brief, deliverables, status
                ) VALUES (
                  ${brandUserId}, 'instagram', ${username.toLowerCase()},
                  ${parsed.creatorHandle.toLowerCase()}, 'instagram', ${creatorUserId},
                  ${budgetCents}, ${feeCents}, ${comment.text}, ${parsed.deliverables || 'social media offer'}, 'pending'
                )
              `.catch((e: any) => console.error("[IG Poll] Offer insert error:", e));
              offerCreated = true;
            } catch (e) {
              console.error("[IG Poll] Offer creation failed:", e);
            }

            replyText = generateOfferReply(
              parsed.creatorHandle,
              username,
              parsed.budget!,
              parsed.deliverables,
              "instagram"
            );
          } else {
            replyText = generateSmartReply(comment.text, username, "instagram");
          }

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

            // Track the reply (store creator handle for rate limiting by creator)
            if (replyRes.ok) {
              await sql`
                INSERT INTO ig_replied_comments (comment_id, username) VALUES (${comment.id}, ${creatorHandle})
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
              offer_detected: parsed.hasOffer,
              offer_created: offerCreated,
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
