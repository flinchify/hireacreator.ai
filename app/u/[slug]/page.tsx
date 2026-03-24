export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCreatorBySlug } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { LinkInBioContent } from "@/components/link-in-bio-content";
import { OwnerEditBar } from "@/components/owner-edit-bar";
import { UnclaimedProfile } from "./unclaimed-profile";
import { ClaimBanner } from "./claim-banner";
import { designProfile } from "@/lib/ai-profile-designer";
import type { Creator } from "@/lib/types";

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
      title: `${name} | HireACreator.ai`,
      description: `${name} on HireACreator. Claim this profile to start receiving brand deals.`,
      openGraph: {
        title: `${name} on HireACreator`,
        description: `${name} on HireACreator. Claim this profile to start receiving brand deals.`,
        images: [
          {
            url: `${baseUrl}/og-profile.jpg`,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} on HireACreator`,
        description: `Claim this profile to start receiving brand deals.`,
        images: [`${baseUrl}/og-profile.jpg`],
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

export default async function LinkInBioPage({ params, searchParams }: { params: { slug: string }; searchParams: { preview?: string } }) {
  const isPreview = searchParams.preview === "true";
  // Check claimed_profiles first for auto-generated unclaimed profiles
  const autoProfile = await getAutoProfile(params.slug);

  if (autoProfile && !autoProfile.claimed_by) {
    // Use stored design fields or generate on-the-fly
    const hasStoredDesign = !!(autoProfile.link_bio_template);
    const niche = (autoProfile.niche as string) || "general";
    const followerCount = (autoProfile.follower_count as number) || 0;

    let template = autoProfile.link_bio_template as string || "";
    let bgType = autoProfile.link_bio_bg_type as string || "";
    let bgValue = autoProfile.link_bio_bg_value as string || "";
    let textColor = autoProfile.link_bio_text_color as string || "";
    let font = autoProfile.link_bio_font as string || "";
    let buttonShape = autoProfile.link_bio_button_shape as string || "";
    let headline = autoProfile.link_bio_headline as string || "";

    if (!hasStoredDesign) {
      const design = designProfile({
        platform: (autoProfile.platform as string) || "instagram",
        handle: (autoProfile.platform_handle as string) || "",
        displayName: (autoProfile.display_name as string) || (autoProfile.platform_handle as string),
        avatarUrl: autoProfile.avatar_url as string | null,
        bio: autoProfile.bio as string | null,
        followerCount,
        followingCount: (autoProfile.following_count as number) || 0,
        postCount: (autoProfile.post_count as number) || 0,
        isVerified: false,
        category: niche,
        externalUrl: null,
        websites: [],
        otherSocials: [],
        profileUrl: "",
        isBusinessAccount: false,
      });
      template = design.template;
      bgType = design.bgType;
      bgValue = design.bgValue;
      textColor = design.textColor;
      font = design.font;
      buttonShape = design.buttonShape;
      headline = design.suggestedHeadline;
    }

    const creator: Creator = {
      id: autoProfile.id as string,
      name: (autoProfile.display_name as string) || (autoProfile.platform_handle as string),
      slug: params.slug,
      avatar: autoProfile.avatar_url as string | null,
      cover: null,
      headline: headline || null,
      bio: autoProfile.bio as string | null,
      location: null,
      category: niche,
      hourlyRate: null,
      rating: 0,
      reviewCount: 0,
      totalProjects: 0,
      isVerified: false,
      isFeatured: false,
      isOnline: false,
      isPro: false,
      subscriptionTier: "free",
      visibleInMarketplace: false,
      websiteUrl: null,
      businessName: null,
      businessUrl: null,
      allowMessages: false,
      is18PlusContent: false,
      linkBioTemplate: template || "minimal",
      linkBioAccent: "",
      linkBioFont: font || "jakarta",
      linkBioTextColor: textColor || "",
      linkBioBgType: bgType || "gradient",
      linkBioBgValue: bgValue || "",
      linkBioBgVideo: "",
      linkBioBgImages: [],
      linkBioButtonShape: buttonShape || "soft",
      linkBioButtonAnim: "",
      linkBioCardStyle: "",
      linkBioIntroAnim: "none",
      linkBioTextSize: "",
      linkBioAvatarSize: "",
      linkBioButtonSize: "",
      linkBioContentPosition: "",
      linkBioContentAlign: "",
      hasStripeAccount: false,
      calendarEnabled: false,
      profileViews: 0,
      nicheRank: 0,
      creatorScore: (autoProfile.creator_score as number) || 0,
      scoreBreakdown: typeof autoProfile.score_breakdown === "string"
        ? JSON.parse(autoProfile.score_breakdown)
        : autoProfile.score_breakdown || {},
      bioLinks: (Array.isArray(autoProfile.auto_bio_links) ? autoProfile.auto_bio_links : []).map((l: any, i: number) => ({
        id: `auto-bl-${i}`, title: l.title || "", url: l.url || "", thumbnailUrl: null, isVisible: true, isPinned: false, clickCount: 0, sectionName: null, displayStyle: "default",
      })),
      socials: (Array.isArray(autoProfile.auto_socials) ? autoProfile.auto_socials : []).map((s: any) => ({
        platform: s.platform || "", handle: s.handle || "", followers: "", url: s.url || "",
      })),
      services: [],
      portfolio: [],
      reviews: [],
      products: [],
      testimonials: [],
    };

    return (
      <>
        <LinkInBioContent creator={creator} isUnclaimed />
        <ClaimBanner
          platform={(autoProfile.platform as string) || "instagram"}
          handle={(autoProfile.platform_handle as string) || ""}
        />
      </>
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
            {isOwner && !isPreview && <OwnerEditBar slug={params.slug} />}
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
      {isOwner && !isPreview && <OwnerEditBar slug={params.slug} />}
      <LinkInBioContent creator={creator} />
    </>
  );
}
