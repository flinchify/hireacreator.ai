export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCreatorBySlug } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { LinkInBioContent } from "@/components/link-in-bio-content";
import { OwnerEditBar } from "@/components/owner-edit-bar";
import { UnclaimedProfile } from "./unclaimed-profile";

async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  try {
    const sql = getDb();
    const rows = await sql`SELECT user_id FROM auth_sessions WHERE token = ${token} AND expires_at > NOW() LIMIT 1`;
    return rows[0]?.user_id || null;
  } catch { return null; }
}

async function getAutoProfile(slug: string) {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM claimed_profiles
      WHERE auto_profile_slug = ${slug}
      LIMIT 1
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  }
}

async function getMatchingCampaigns(niche: string, followerCount: number, platform: string) {
  try {
    const sql = getDb();
    return await sql`
      SELECT id, title, niche, budget_per_creator_cents, platforms
      FROM brand_campaigns
      WHERE status = 'active'
        AND (niche = ${niche} OR niche IS NULL)
        AND min_followers <= ${followerCount}
        AND (max_followers IS NULL OR max_followers >= ${followerCount})
        AND (platforms = '{}' OR ${platform} = ANY(platforms))
      ORDER BY budget_per_creator_cents DESC NULLS LAST
      LIMIT 5
    `;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Check claimed_profiles first
  const autoProfile = await getAutoProfile(params.slug);
  if (autoProfile && !autoProfile.claimed_by) {
    const name = (autoProfile.display_name as string) || `@${autoProfile.platform_handle}`;
    const score = autoProfile.creator_score || 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hireacreator.ai";
    return {
      title: `${name} - Score ${score}/100 | HireACreator.ai`,
      description: `${name} scored ${score}/100 on HireACreator. Claim this profile to start receiving brand deals.`,
      openGraph: {
        title: `${name} - Creator Score ${score}/100`,
        description: `${name} scored ${score}/100 on HireACreator.`,
        images: [
          {
            url: `${baseUrl}/api/og/score?platform=${autoProfile.platform}&handle=${autoProfile.platform_handle}&score=${score}`,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  }

  // Fall back to users table
  let creator;
  try { creator = await getCreatorBySlug(params.slug); } catch { return { title: "Creator - HireACreator.ai" }; }
  if (!creator) return { title: "Creator - HireACreator.ai" };
  return {
    title: `${creator.name} - HireACreator.ai`,
    description: creator.headline || creator.bio || `${creator.name} on HireACreator.ai`,
    openGraph: { title: creator.name, description: creator.headline || "", images: creator.avatar ? [creator.avatar] : [] },
  };
}

export default async function LinkInBioPage({ params }: { params: { slug: string } }) {
  // Check claimed_profiles first for auto-generated unclaimed profiles
  const autoProfile = await getAutoProfile(params.slug);

  if (autoProfile && !autoProfile.claimed_by) {
    // Unclaimed auto-generated profile
    const campaigns = await getMatchingCampaigns(
      (autoProfile.niche as string) || "general",
      (autoProfile.follower_count as number) || 0,
      (autoProfile.platform as string) || "instagram"
    );

    const breakdown = typeof autoProfile.score_breakdown === "string"
      ? JSON.parse(autoProfile.score_breakdown)
      : autoProfile.score_breakdown || {};

    return (
      <UnclaimedProfile
        profile={{
          platform: autoProfile.platform as string,
          handle: autoProfile.platform_handle as string,
          displayName: (autoProfile.display_name as string) || (autoProfile.platform_handle as string),
          avatarUrl: autoProfile.avatar_url as string | null,
          bio: autoProfile.bio as string | null,
          followerCount: (autoProfile.follower_count as number) || 0,
          followingCount: (autoProfile.following_count as number) || 0,
          postCount: (autoProfile.post_count as number) || 0,
          niche: (autoProfile.niche as string) || "general",
          score: (autoProfile.creator_score as number) || 0,
          breakdown,
          estimatedPostValue: (autoProfile.estimated_post_value as number) || 500,
          slug: params.slug,
        }}
        campaigns={campaigns.map((c) => ({
          id: c.id as string,
          title: c.title as string,
          niche: (c.niche as string) || "",
          budgetPerCreator: (c.budget_per_creator_cents as number) || 0,
        }))}
      />
    );
  }

  // If claimed, check if there's a linked user profile
  if (autoProfile && autoProfile.claimed_by) {
    // Try loading the user profile
    try {
      const creator = await getCreatorBySlug(params.slug);
      if (creator) {
        const sessionUserId = await getSessionUserId();
        const isOwner = sessionUserId === creator.id;
        if (!isOwner) {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hireacreator.ai"}/api/profile/view?slug=${params.slug}`).catch(() => {});
        }
        return (
          <>
            {isOwner && <OwnerEditBar slug={params.slug} />}
            <LinkInBioContent creator={creator} />
          </>
        );
      }
    } catch {}
  }

  // Standard user profile lookup
  let creator;
  try { creator = await getCreatorBySlug(params.slug); } catch { notFound(); }
  if (!creator) notFound();

  const sessionUserId = await getSessionUserId();
  const isOwner = sessionUserId === creator.id;

  if (!isOwner) {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hireacreator.ai"}/api/profile/view?slug=${params.slug}`).catch(() => {});
  }

  return (
    <>
      {isOwner && <OwnerEditBar slug={params.slug} />}
      <LinkInBioContent creator={creator} />
    </>
  );
}
