export interface ParsedCommand {
  type: "score" | "whois" | "make_bio" | "make_profile" | "unknown";
  targetHandle: string | null;
  platform: string;
  requesterHandle: string;
  rawText: string;
}

export function parseCommand(
  text: string,
  mentions: string[],
  requesterHandle: string,
  platform: string
): ParsedCommand {
  const lower = text.toLowerCase().trim();
  const otherMentions = mentions
    .map((m) => m.replace(/^@/, "").toLowerCase())
    .filter(
      (h) =>
        h !== requesterHandle.toLowerCase() &&
        h !== "hireacreator" &&
        h !== "hireacreatorai"
    );
  const firstOther = otherMentions[0] || null;

  // "who is @handle" or "who is this"
  if (/\bwho\s+is\b/.test(lower)) {
    return {
      type: "whois",
      targetHandle: firstOther || requesterHandle,
      platform,
      requesterHandle,
      rawText: text,
    };
  }

  // "make me a linkinbio/bio/profile"
  if (/\bmake\s+me\s+a\s+(linkinbio|link\s*in\s*bio|bio|profile)\b/.test(lower)) {
    return {
      type: "make_bio",
      targetHandle: requesterHandle,
      platform,
      requesterHandle,
      rawText: text,
    };
  }

  // "make @handle a linkinbio/bio/profile"
  if (/\bmake\s+@?\w+\s+a\s+(linkinbio|link\s*in\s*bio|bio|profile)\b/.test(lower)) {
    return {
      type: "make_profile",
      targetHandle: firstOther || requesterHandle,
      platform,
      requesterHandle,
      rawText: text,
    };
  }

  // "score @handle" or "rate @handle"
  if (/\b(score|rate)\b/.test(lower)) {
    return {
      type: "score",
      targetHandle: firstOther || requesterHandle,
      platform,
      requesterHandle,
      rawText: text,
    };
  }

  // Just a tag with no command — default to score
  if (
    mentions.some(
      (m) =>
        m.replace(/^@/, "").toLowerCase() === "hireacreator" ||
        m.replace(/^@/, "").toLowerCase() === "hireacreatorai"
    )
  ) {
    return {
      type: "score",
      targetHandle: firstOther || requesterHandle,
      platform,
      requesterHandle,
      rawText: text,
    };
  }

  return {
    type: "unknown",
    targetHandle: null,
    platform,
    requesterHandle,
    rawText: text,
  };
}
