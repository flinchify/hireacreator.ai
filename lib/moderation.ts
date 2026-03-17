// Banned words list — messages containing these are auto-flagged
const BANNED_WORDS = [
  // Slurs and hate speech
  "nigger", "nigga", "faggot", "retard", "tranny", "kike", "spic", "chink", "wetback",
  // Explicit sexual content
  "nude", "nudes", "dick pic", "send nudes", "onlyfans link", "sex for",
  // Scam patterns
  "send me money", "western union", "gift card", "crypto payment", "pay me outside",
  "cashapp me", "venmo me", "wire transfer", "advance payment",
  // Violence
  "kill yourself", "kys", "i will kill", "death threat",
  // Contact evasion (trying to go off-platform)
  "whats your number", "give me your number", "text me at", "call me at",
];

// Regex patterns for phone numbers, emails (to warn about off-platform contact)
const SUSPICIOUS_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
  /\b(paypal\.me|cash\.app|venmo)\b/i,
];

export interface ModerationResult {
  allowed: boolean;
  flagged: boolean;
  reason?: string;
  cleanContent: string;
}

export function moderateMessage(content: string): ModerationResult {
  const lower = content.toLowerCase();

  // Check banned words
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      return {
        allowed: false,
        flagged: true,
        reason: `Contains prohibited content`,
        cleanContent: content,
      };
    }
  }

  // Check suspicious patterns (allow but flag for review)
  let flagged = false;
  let reason: string | undefined;
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      flagged = true;
      reason = "Contains contact information or payment reference";
      break;
    }
  }

  return {
    allowed: true,
    flagged,
    reason,
    cleanContent: content.trim(),
  };
}
