import type { ParsedCommand } from "./command-parser";
import { identifyCreator } from "./celebrity-lookup";
import { generateAutoProfile } from "./auto-profile";
import { generateTagReply } from "./bot-replies";
import { crossReferenceSocials, fetchSocialProfile } from "./social-scraper";

export interface CommandResponse {
  replyText: string;
  profileUrl: string | null;
  action: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

export async function handleCommand(
  cmd: ParsedCommand
): Promise<CommandResponse> {
  switch (cmd.type) {
    case "whois":
      return handleWhois(cmd);
    case "make_bio":
      return handleMakeBio(cmd);
    case "make_profile":
      return handleMakeProfile(cmd);
    case "score":
      return handleScore(cmd);
    default:
      return {
        replyText: truncate(
          `Tag someone with @hireacreator to build their creator profile and score.`,
          280
        ),
        profileUrl: null,
        action: "unknown_command",
      };
  }
}

async function handleWhois(cmd: ParsedCommand): Promise<CommandResponse> {
  const target = cmd.targetHandle || cmd.requesterHandle;
  const creator = await identifyCreator(target);

  if (!creator) {
    return {
      replyText: truncate(
        `We do not have @${target} in our database yet. Want us to build their profile? Tag them with @hireacreator!`,
        280
      ),
      profileUrl: null,
      action: "whois_not_found",
    };
  }

  const totalFollowers = creator.platforms.reduce(
    (sum, p) => sum + p.followers,
    0
  );
  const platformNames = creator.platforms.map((p) => p.platform).join(", ");

  return {
    replyText: truncate(
      `@${target} is ${creator.name} -- ${creator.category} creator with ${formatFollowers(totalFollowers)} followers. Found on: ${platformNames}. Full profile: ${creator.profileUrl}`,
      280
    ),
    profileUrl: creator.profileUrl,
    action: "whois_found",
  };
}

async function handleMakeBio(cmd: ParsedCommand): Promise<CommandResponse> {
  const handle = cmd.requesterHandle;
  const result = await generateAutoProfile(cmd.platform, handle);

  // Cross-reference other socials
  const profile = await fetchSocialProfile(cmd.platform, handle);
  if (profile) {
    await crossReferenceSocials(profile);
  }

  return {
    replyText: truncate(
      `Your link-in-bio is ready! All your socials in one place: hireacreator.ai/u/${result.slug} -- Claim it to customize.`,
      280
    ),
    profileUrl: result.profileUrl,
    action: "make_bio",
  };
}

async function handleMakeProfile(
  cmd: ParsedCommand
): Promise<CommandResponse> {
  const target = cmd.targetHandle || cmd.requesterHandle;
  const result = await generateAutoProfile(cmd.platform, target);

  return {
    replyText: truncate(
      `We just built @${target} a creator profile -- Score: ${result.score.score}/100. Check it out: hireacreator.ai/u/${result.slug}`,
      280
    ),
    profileUrl: result.profileUrl,
    action: "make_profile",
  };
}

async function handleScore(cmd: ParsedCommand): Promise<CommandResponse> {
  const target = cmd.targetHandle || cmd.requesterHandle;
  const result = await generateAutoProfile(cmd.platform, target, {
    referrerHandle: cmd.requesterHandle,
  });

  const replyText = generateTagReply(
    result.profile.handle,
    result.slug,
    result.score.score,
    result.score.estimatedPostValue
  );

  return {
    replyText: truncate(replyText, 280),
    profileUrl: result.profileUrl,
    action: "score",
  };
}
