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
    `We just analyzed @${h} — ${sc}/100 creator score, ~${v}/post potential. See more: hireacreator.ai/u/${s}`,
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
