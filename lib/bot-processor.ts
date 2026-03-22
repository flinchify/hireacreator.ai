import { getDb } from "./db";
import { parseCommand } from "./command-parser";
import { handleCommand } from "./command-responses";
import { replyToComment, replyToMention, INSTAGRAM_CONFIGURED } from "./instagram-bot";
import { replyToTweet, X_CONFIGURED } from "./x-bot";

export async function processIncomingMention(params: {
  platform: "instagram" | "x";
  text: string;
  mentions: string[];
  requesterHandle: string;
  postId: string;
  commentId?: string;
  mediaId?: string;
}): Promise<{
  success: boolean;
  replyText: string;
  profileUrl: string | null;
}> {
  const db = getDb();

  // 1. Parse the command
  const cmd = parseCommand(
    params.text,
    params.mentions,
    params.requesterHandle,
    params.platform
  );

  // 2. Log the incoming event
  await db`
    INSERT INTO tag_events (platform, tagged_handle, tagger_handle, source_url, post_id, comment_reply_id, status)
    VALUES (
      ${params.platform},
      ${cmd.targetHandle || params.requesterHandle},
      ${params.requesterHandle},
      ${null},
      ${params.postId},
      ${params.commentId || null},
      'pending'
    )
  `;

  let response: { replyText: string; profileUrl: string | null; action: string };
  try {
    // 3. Run command handler
    response = await handleCommand(cmd);
  } catch (err) {
    console.error(`[BOT] Command handler error:`, err);
    await db`
      UPDATE tag_events SET status = 'failed', error_message = ${String(err)}
      WHERE post_id = ${params.postId} AND tagger_handle = ${params.requesterHandle} AND status = 'pending'
    `;
    return {
      success: false,
      replyText: "",
      profileUrl: null,
    };
  }

  // 4. Post the reply via platform bot service
  let posted = false;
  if (params.platform === "instagram") {
    if (INSTAGRAM_CONFIGURED) {
      if (params.commentId) {
        posted = await replyToComment(params.commentId, response.replyText);
      } else if (params.mediaId) {
        posted = await replyToMention(params.mediaId, response.replyText);
      }
    }
  } else if (params.platform === "x") {
    if (X_CONFIGURED) {
      posted = await replyToTweet(params.postId, response.replyText);
    }
  }

  // 5. Update tag event status
  const finalStatus = posted ? "replied" : "profile_created";
  await db`
    UPDATE tag_events SET
      status = ${finalStatus},
      comment_reply_id = COALESCE(comment_reply_id, ${params.commentId || null})
    WHERE post_id = ${params.postId} AND tagger_handle = ${params.requesterHandle} AND status = 'pending'
  `;

  console.log(
    `[BOT] ${params.platform}/@${params.requesterHandle} -> ${cmd.type}: ${response.replyText.slice(0, 100)}`
  );

  return {
    success: true,
    replyText: response.replyText,
    profileUrl: response.profileUrl,
  };
}
