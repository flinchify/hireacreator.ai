import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateSmartReply, parseOfferFromText, generateOfferReply } from "@/lib/bot-replies";

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "hireacreator-ig-verify-2026";

/**
 * GET — Webhook verification (Meta sends this to confirm your endpoint)
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Instagram Webhook] Verified");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * POST — Incoming webhook events (mentions, comments)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Instagram Webhook] Event:", JSON.stringify(body, null, 2));

    const sql = getDb();

    // Process each entry
    for (const entry of body.entry || []) {
      // Handle mentions
      for (const change of entry.changes || []) {
        if (change.field === "mentions" || change.field === "comments") {
          const mediaId = change.value?.media_id;
          const commentId = change.value?.id;
          const text = change.value?.text || "";
          const from = change.value?.from;

          // Log the mention
          await sql`
            INSERT INTO instagram_webhooks (event_type, media_id, comment_id, from_username, from_id, text, raw_payload)
            VALUES (
              ${change.field},
              ${mediaId || null},
              ${commentId || null},
              ${from?.username || null},
              ${from?.id || null},
              ${text},
              ${JSON.stringify(change.value)}
            )
          `.catch(() => {
            // Table might not exist yet, just log
            console.log("[Instagram Webhook] Could not save to DB, logging only");
          });

          // If someone tagged @hireacreatorai, auto-build their profile
          if (text.toLowerCase().includes("@hireacreator") && from?.username) {
            console.log(`[Instagram Webhook] Mention detected from @${from.username}`);

            // Extract @mentions from comment text (excluding @hireacreator variants)
            const mentionMatches = text.match(/@([\w.]+)/g) || [];
            const otherMentions = mentionMatches
              .map((m: string) => m.slice(1).toLowerCase())
              .filter((h: string) => !h.startsWith("hireacreator"));

            // If another @username is found, they're the creator being recommended
            // The commenter is the brand/recommender, the tagged person is the creator
            const creatorHandle = otherMentions.length > 0 ? otherMentions[0] : from.username;

            console.log(`[Instagram Webhook] Building profile for creator: @${creatorHandle} (commenter: @${from.username})`);

            // Queue profile creation for the creator (fire and forget)
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai"}/api/score`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ platform: "instagram", handle: creatorHandle }),
            }).catch(() => {});

            // Auto-reply to the comment mentioning the creator
            if (commentId) {
              // Check if already replied (prevent duplicates from webhook + poll overlap)
              await sql`CREATE TABLE IF NOT EXISTS ig_replied_comments (comment_id TEXT PRIMARY KEY, username TEXT, replied_at TIMESTAMPTZ DEFAULT NOW())`.catch(() => {});
              const alreadyReplied = await sql`SELECT comment_id FROM ig_replied_comments WHERE comment_id = ${commentId}`.catch(() => []);
              
              if (alreadyReplied && alreadyReplied.length > 0) {
                console.log(`[Instagram Webhook] Already replied to comment ${commentId}, skipping`);
              } else {
                // Check for offer in comment text
                const parsed = parseOfferFromText(text);
                let replyText: string;

                if (parsed.hasOffer && parsed.creatorHandle) {
                  // Create offer in DB
                  try {
                    let brandUserId: string | null = null;
                    const brandRows = await sql`
                      SELECT u.id FROM users u
                      JOIN social_connections sc ON sc.user_id = u.id
                      WHERE sc.platform = 'instagram' AND LOWER(sc.handle) = LOWER(${from.username})
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

                    if (brandUserId) {
                      await sql`
                        INSERT INTO offers (
                          brand_user_id, creator_handle, creator_platform, creator_user_id,
                          budget_cents, fee_cents, brief, deliverables, status
                        ) VALUES (
                          ${brandUserId}, ${parsed.creatorHandle.toLowerCase()}, 'instagram', ${creatorUserId},
                          ${budgetCents}, ${feeCents}, ${text}, ${parsed.deliverables || 'social media offer'}, 'pending'
                        )
                      `.catch((e: any) => console.error("[IG Webhook] Offer insert error:", e));
                    }
                  } catch (e) {
                    console.error("[IG Webhook] Offer creation failed:", e);
                  }

                  replyText = generateOfferReply(
                    parsed.creatorHandle,
                    from.username,
                    parsed.budget!,
                    parsed.deliverables,
                    "instagram"
                  );
                } else {
                  replyText = generateSmartReply(text, from.username, "instagram");
                }

                const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
                if (accessToken) {
                  const replyRes = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      message: replyText,
                      access_token: accessToken,
                    }),
                  }).catch((err) => {
                    console.error("[Instagram Webhook] Reply failed:", err);
                    return null;
                  });

                  // Track the reply
                  if (replyRes && replyRes.ok) {
                    await sql`INSERT INTO ig_replied_comments (comment_id, username) VALUES (${commentId}, ${from.username || 'unknown'})`.catch(() => {});
                  }
                }
              }
            }
          }
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[Instagram Webhook] Error:", e);
    // Still return 200 — Meta will retry on non-200
    return NextResponse.json({ received: true });
  }
}
