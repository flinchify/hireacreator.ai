const TEMPLATES = [
  (h: string, s: string, sc: number, v: string) =>
    `Just built @${h} a brand profile on HireACreator — Score: ${sc}/100 | Check it out: hireacreator.ai/u/${s}`,
  (h: string, s: string, sc: number, v: string) =>
    `@${h} your creator profile is live — brands can find you now. Score: ${sc}/100 → hireacreator.ai/u/${s}`,
  (h: string, s: string, sc: number, v: string) =>
    `We scored @${h} at ${sc}/100 for brand deals. See the full breakdown: hireacreator.ai/u/${s}`,
  (h: string, s: string, sc: number, v: string) =>
    `@${h} is worth ~${v}/post according to our AI. Full profile: hireacreator.ai/u/${s}`,
  (h: string, s: string, sc: number, v: string) =>
    `Brand profile for @${h} is ready — scored ${sc}/100. Claim it here: hireacreator.ai/u/${s}`,
  (h: string, s: string, sc: number, v: string) =>
    `We just analyzed @${h} — ${sc}/100 creator rating, ~${v}/post potential. See more: hireacreator.ai/u/${s}`,
];

function formatCents(cents: number): string {
  if (cents >= 100_000) return `$${Math.round(cents / 100_000)}K`;
  if (cents >= 100) return `$${Math.round(cents / 100)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

export function generateTagReply(
  handle: string,
  slug: string,
  score: number,
  estimatedPostValue: number
): string {
  const value = formatCents(estimatedPostValue);
  const idx = Math.floor(Math.random() * TEMPLATES.length);
  const reply = TEMPLATES[idx](handle, slug, score, value);
  // Ensure under 280 chars for X compatibility
  if (reply.length > 280) {
    return `@${handle} scored ${score}/100 for brand deals. Profile: hireacreator.ai/u/${slug}`;
  }
  return reply;
}

export function generateClaimNotification(handle: string, slug: string): string {
  return `Your HireACreator profile has been claimed! Customize it at hireacreator.ai/u/${slug}/edit`;
}

export type BotPlatform = "x" | "instagram";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function claimUrl(platform: BotPlatform, handle: string): string {
  return `hireacreator.ai/claim?platform=${platform}&handle=${handle}`;
}

/* ─── Offer parsing from tweet/comment text ─── */

export interface ParsedOffer {
  hasOffer: boolean;
  budget?: number;
  deliverables?: string;
  creatorHandle?: string;
}

/**
 * Parse a tweet/comment for an offer: dollar amount, creator @handle, deliverables.
 * Examples:
 *   '@hireacreatorAI @konnydev pay $200 for code review' → { hasOffer: true, budget: 200, deliverables: 'code review', creatorHandle: 'konnydev' }
 *   '@hireacreatorAI check me out' → { hasOffer: false }
 */
export function parseOfferFromText(text: string): ParsedOffer {
  // Extract dollar amounts: $200, $1,500, $50.00, $1.5k, $2k
  const moneyMatch = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)\s*k?\b/i);
  if (!moneyMatch) return { hasOffer: false };

  let budget = parseFloat(moneyMatch[1].replace(/,/g, ""));
  // Handle $1.5k, $2k style
  if (/\$\s*[\d,]+(?:\.\d{1,2})?\s*k\b/i.test(text)) {
    budget *= 1000;
  }
  if (budget <= 0 || budget > 99999) return { hasOffer: false };

  // Extract @mentions that aren't @hireacreator*
  const mentionMatches = text.match(/@([\w.]+)/g) || [];
  const otherMentions = mentionMatches
    .map((m) => m.slice(1).toLowerCase())
    .filter((h) => !h.startsWith("hireacreator"));

  const creatorHandle = otherMentions.length > 0 ? otherMentions[0] : undefined;

  // Extract deliverables: text after the dollar amount, often preceded by 'for', 'for a', 'to do'
  let deliverables: string | undefined;
  const afterMoney = text.slice((moneyMatch.index || 0) + moneyMatch[0].length);
  const deliverableMatch = afterMoney.match(/(?:for\s+(?:a\s+)?|to\s+do\s+|to\s+)(.+)/i);
  if (deliverableMatch) {
    // Clean up: remove trailing @mentions, URLs, and trim
    deliverables = deliverableMatch[1]
      .replace(/@[\w.]+/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/hireacreator\.\S+/g, "")
      .trim()
      .replace(/[.!,]+$/, "")
      .trim();
    if (!deliverables) deliverables = undefined;
  }

  // Also try: 'pay you $X for Y' where deliverables come after 'for'
  if (!deliverables) {
    const beforeMoney = text.slice(0, moneyMatch.index || 0);
    const afterAll = text.slice((moneyMatch.index || 0) + moneyMatch[0].length);
    const forMatch = afterAll.match(/\s+for\s+(.+)/i) || beforeMoney.match(/for\s+(.+?)(?:\$)/i);
    if (forMatch) {
      deliverables = forMatch[1]
        .replace(/@[\w.]+/g, "")
        .replace(/https?:\/\/\S+/g, "")
        .replace(/hireacreator\.\S+/g, "")
        .trim()
        .replace(/[.!,]+$/, "")
        .trim();
      if (!deliverables) deliverables = undefined;
    }
  }

  return { hasOffer: true, budget, deliverables, creatorHandle };
}

/* ─── Offer reply templates ─── */

function formatBudget(budget: number): string {
  if (budget >= 1000 && budget % 1000 === 0) return `$${budget / 1000}k`;
  return `$${budget}`;
}

export function generateOfferReply(
  creatorHandle: string,
  brandHandle: string,
  budget: number,
  deliverables: string | undefined,
  platform: BotPlatform
): string {
  const amount = formatBudget(budget);
  const url = claimUrl(platform, creatorHandle);
  const task = deliverables ? ` for ${deliverables}` : "";

  return pick([
    `yo @${creatorHandle} @${brandHandle} just offered you ${amount}${task}. claim your profile to accept ${url}`,
    `@${creatorHandle} you just got a ${amount} offer from @${brandHandle}${task}. claim it ${url}`,
    `heads up @${creatorHandle}, @${brandHandle} wants to pay you ${amount}${task}. your profile is ready ${url}`,
  ]);
}

/* ─── Smart contextual replies for X and Instagram bots ─── */

/**
 * Generate a smart, contextual reply based on comment/tweet content.
 * Casual, lowercase, no caps, no emojis. Randomized per category.
 */
export function generateSmartReply(
  text: string,
  authorUsername: string,
  platform: BotPlatform
): string {
  const lower = text.toLowerCase();

  // Check if the text mentions another @username (brand tagging a creator)
  const mentionMatches = text.match(/@([\w.]+)/g) || [];
  const otherMentions = mentionMatches
    .map((m) => m.slice(1).toLowerCase())
    .filter(
      (h) =>
        h !== authorUsername.toLowerCase() &&
        !h.startsWith("hireacreator")
    );

  // Brand tagging a creator — offer flow
  if (otherMentions.length > 0) {
    const creator = otherMentions[0];
    const url = claimUrl(platform, creator);
    return pick([
      `yo @${creator} someone tagged you for a collab. your profile is ready ${url}`,
      `@${creator} looks like a brand wants to work with you. claim your page and check offers ${url}`,
      `heads up @${creator} you just got tagged for a deal. your creator page is live ${url}`,
    ]);
  }

  // Self-promo — creator wants to be discovered
  if (
    lower.includes("check me out") ||
    lower.includes("check out my") ||
    lower.includes("follow me") ||
    lower.includes("subscribe") ||
    lower.includes("my content") ||
    lower.includes("i create") ||
    lower.includes("i make") ||
    lower.includes("my channel") ||
    lower.includes("my page") ||
    lower.includes("hire me") ||
    lower.includes("collab")
  ) {
    const url = claimUrl(platform, authorUsername);
    return pick([
      `just made your page @${authorUsername}. brands can find you and send offers now ${url}`,
      `your profile is live @${authorUsername}. claim it and start getting brand deals ${url}`,
      `done @${authorUsername}. your page is up, brands can send you offers now ${url}`,
    ]);
  }

  // Questions about hireacreator
  if (
    lower.includes("what is hireacreator") ||
    lower.includes("what does hireacreator") ||
    lower.includes("how does hireacreator") ||
    lower.includes("how do i") ||
    lower.includes("what's hireacreator") ||
    lower.includes("how it work")
  ) {
    return pick([
      `we connect creators with brand deals. tag any @ with us and we build their page instantly. brands can send offers directly hireacreator.ai`,
      `basically brands find creators through us, send offers, pay through the platform. creators keep 100%. tag us with anyones @ and we make their page hireacreator.ai`,
      `we connect creators with brands. tag any @ with us and we build their page hireacreator.ai`,
    ]);
  }

  // Has a question mark — try to be helpful
  if (lower.includes("?")) {
    const url = claimUrl(platform, authorUsername);
    return `we build creator profiles and connect them with brand deals. tag us with anyones @ and we make their page. brands can send offers directly ${url}`;
  }

  // Offer-related — brand wants to send an offer
  if (
    lower.includes("offer") ||
    lower.includes("hire") ||
    lower.includes("book") ||
    lower.includes("campaign") ||
    lower.includes("sponsor") ||
    lower.includes("budget") ||
    lower.includes("deal")
  ) {
    const target = otherMentions.length > 0 ? otherMentions[0] : authorUsername;
    const url = claimUrl(platform, target);
    return `you can send an offer to @${target} directly on our platform. their profile is ready ${url}`;
  }

  // Default — chill acknowledgment
  const url = claimUrl(platform, authorUsername);
  return pick([
    `made your page @${authorUsername}. claim it whenever, brands can find you now ${url}`,
    `your creator page is up @${authorUsername}. claim it whenever ${url}`,
    `set you up @${authorUsername}. your page is live ${url}`,
  ]);
}
