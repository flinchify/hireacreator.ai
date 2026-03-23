import { NextResponse } from "next/server";
import {
  searchRecentTweets,
  getUserByUsername,
  getUserMentions,
  replyToTweet,
  generateSmartReply,
  scrapeXProfile,
  getMaskedOAuthDetails,
} from "@/lib/x-bot";

export const maxDuration = 30;

/**
 * GET /api/twitter/test-reply
 * Full debug endpoint: tries all query formats, shows raw responses,
 * OAuth details (masked), and attempts smart replies.
 */
export async function GET() {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken)
    return NextResponse.json({ error: "No X_BEARER_TOKEN" });

  const results: any = {
    steps: [],
    oauth_credentials: getMaskedOAuthDetails(),
  };

  try {
    // --- Step 1: Try all search query formats ---
    const queries = [
      { label: "mention", query: "@hireacreatorAI" },
      { label: "to_reply", query: "to:hireacreatorAI" },
      { label: "keyword", query: "hireacreatorAI" },
    ];

    let winningQuery: string | null = null;
    let winningTweets: any[] = [];
    let winningUsers: any[] = [];

    for (const { label, query } of queries) {
      const result = await searchRecentTweets(query);
      const step: any = {
        step: `search_${label}`,
        query,
        raw_url: result.url,
        status: result.raw?.errors ? "error" : "ok",
        tweet_count: result.data.length,
        meta: result.meta,
        raw_response: result.raw,
      };

      if (result.data.length > 0) {
        step.sample_tweets = result.data.slice(0, 3).map((t: any) => ({
          id: t.id,
          text: t.text,
          author_id: t.author_id,
        }));
      }

      results.steps.push(step);

      if (result.data.length > 0 && !winningQuery) {
        winningQuery = label;
        winningTweets = result.data;
        winningUsers = result.includes?.users || [];
      }
    }

    // --- Step 2: Try mentions endpoint ---
    const botUser = await getUserByUsername("hireacreatorAI");
    if (botUser) {
      results.steps.push({
        step: "resolve_bot_user",
        user_id: botUser.id,
        name: botUser.name,
        followers: botUser.public_metrics?.followers_count,
      });

      const mentionsResult = await getUserMentions(botUser.id);
      const mentionStep: any = {
        step: "mentions_endpoint",
        url: `https://api.x.com/2/users/${botUser.id}/mentions`,
        tweet_count: mentionsResult?.data.length || 0,
        meta: mentionsResult?.meta,
        raw_response: mentionsResult?.raw,
      };

      if (mentionsResult && mentionsResult.data.length > 0) {
        mentionStep.sample_tweets = mentionsResult.data.slice(0, 3).map((t: any) => ({
          id: t.id,
          text: t.text,
          author_id: t.author_id,
        }));

        if (!winningQuery) {
          winningQuery = "mentions_endpoint";
          winningTweets = mentionsResult.data;
          winningUsers = mentionsResult.includes?.users || [];
        }
      }

      results.steps.push(mentionStep);
    } else {
      results.steps.push({
        step: "resolve_bot_user",
        error: "Could not resolve user ID for @hireacreatorAI",
      });
    }

    results.winning_query = winningQuery;
    results.total_tweets_found = winningTweets.length;

    if (winningTweets.length === 0) {
      results.steps.push({ step: "done", note: "No mentions found across any query format" });
      return NextResponse.json(results);
    }

    // Build user map
    const userMap = new Map<string, any>();
    for (const u of winningUsers) {
      userMap.set(u.id, u);
    }

    // Show all found mentions
    results.mentions = winningTweets.slice(0, 10).map((t: any) => {
      const author = userMap.get(t.author_id);
      return {
        id: t.id,
        text: t.text,
        author: author?.username || t.author_id,
        created_at: t.created_at,
      };
    });

    // --- Step 3: Find newest mention not from us ---
    const mention = winningTweets.find((t: any) => {
      const author = userMap.get(t.author_id);
      return author?.username?.toLowerCase() !== "hireacreatorai";
    });

    if (!mention) {
      results.steps.push({
        step: "find_mention",
        found: false,
        note: "All mentions are from @hireacreatorAI itself",
      });
      return NextResponse.json(results);
    }

    const author = userMap.get(mention.author_id);
    const username = author?.username || "unknown";

    results.steps.push({
      step: "find_mention",
      found: true,
      tweet_id: mention.id,
      from: username,
      text: mention.text,
      author_details: author,
    });

    // --- Step 4: Check OAuth credentials ---
    if (
      !process.env.X_API_KEY ||
      !process.env.X_API_SECRET ||
      !process.env.X_ACCESS_TOKEN ||
      !process.env.X_ACCESS_SECRET
    ) {
      results.steps.push({
        step: "check_oauth",
        error: "Missing OAuth credentials",
      });
      return NextResponse.json(results);
    }
    results.steps.push({ step: "check_oauth", status: "ok" });

    // --- Step 5: Generate smart reply ---
    const replyText = generateSmartReply(mention.text, username);
    results.steps.push({
      step: "generate_reply",
      tweet_text: mention.text,
      smart_reply: replyText,
    });

    // --- Step 6: Scrape user profile ---
    const profile = await scrapeXProfile(username);
    results.steps.push({
      step: "scrape_profile",
      user: profile.user
        ? {
            name: profile.user.name,
            bio: profile.user.description,
            followers: profile.user.public_metrics?.followers_count,
            profile_image: profile.user.profile_image_url,
            url: profile.user.url,
            pinned_tweet_id: profile.user.pinned_tweet_id,
          }
        : null,
      pinned_tweet: profile.pinnedTweet
        ? { text: profile.pinnedTweet.text }
        : null,
      links: profile.links,
    });

    // --- Step 7: Reply to the tweet ---
    const replyResult = await replyToTweet(mention.id, replyText);
    results.steps.push({
      step: "reply",
      ok: replyResult.ok,
      data: replyResult.data,
      error: replyResult.error,
      reply_text: replyText,
    });

    return NextResponse.json(results);
  } catch (e: any) {
    results.error = e.message;
    return NextResponse.json(results);
  }
}
