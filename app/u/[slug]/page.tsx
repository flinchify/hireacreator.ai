export const dynamic = "force-dynamic";
export const revalidate = 0;

import { cookies } from "next/headers";
import { getCreatorBySlug } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { LinkInBioContent } from "@/components/link-in-bio-content";
import { OwnerEditBar } from "@/components/owner-edit-bar";
import { UnclaimedProfile } from "./unclaimed-profile";
import { ClaimBanner } from "./claim-banner";
import { designProfile } from "@/lib/ai-profile-designer";
import { generateAutoProfile } from "@/lib/auto-profile";
import type { Creator } from "@/lib/types";
import Link from "next/link";

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
    const lower = slug.toLowerCase();

    // 1. Exact slug (case-insensitive)
    const rows = await sql`
      SELECT * FROM claimed_profiles
      WHERE LOWER(auto_profile_slug) = ${lower}
      LIMIT 1
    `;
    if (rows.length > 0) return rows[0];

    // 2. Try with platform prefixes
    const prefixes = ["x", "instagram", "tiktok", "youtube"];
    for (const prefix of prefixes) {
      const prefixed = await sql`
        SELECT * FROM claimed_profiles
        WHERE LOWER(auto_profile_slug) = ${`${prefix}-${lower}`}
        LIMIT 1
      `;
      if (prefixed.length > 0) return prefixed[0];
    }

    // 3. Search by platform_handle (case-insensitive)
    const byHandle = await sql`
      SELECT * FROM claimed_profiles
      WHERE LOWER(platform_handle) = ${lower}
      LIMIT 1
    `;
    if (byHandle.length > 0) return byHandle[0];

    return null;
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

  // Fall back to users table (case-insensitive)
  let creator;
  try {
    creator = await getCreatorBySlug(params.slug);
    if (!creator) {
      const sql = getDb();
      const users = await sql`SELECT slug FROM users WHERE LOWER(slug) = ${params.slug.toLowerCase()} LIMIT 1`;
      if (users.length > 0) creator = await getCreatorBySlug(users[0].slug as string);
    }
  } catch { return { title: "Creator - HireACreator.ai" }; }
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

  // Check if logged-in user owns this unclaimed auto-profile
  if (autoProfile && !autoProfile.claimed_by) {
    const sessionUserId = await getSessionUserId();
    if (sessionUserId) {
      try {
        const sql = getDb();
        // Check if user has matching social connection OR slug matches
        const socialMatch = await sql`
          SELECT 1 FROM social_connections
          WHERE user_id = ${sessionUserId}
          AND platform = ${(autoProfile.platform as string)}
          AND LOWER(handle) = LOWER(${(autoProfile.platform_handle as string)})
          LIMIT 1
        `;
        const slugMatch = await sql`SELECT slug FROM users WHERE id = ${sessionUserId} AND LOWER(slug) = ${params.slug.toLowerCase()} LIMIT 1`;
        
        if (socialMatch.length > 0 || slugMatch.length > 0) {
          // Auto-claim and redirect to owner view
          await sql`UPDATE claimed_profiles SET claimed_by = ${sessionUserId}, claimed_at = NOW() WHERE id = ${autoProfile.id}`;
          const creator = await getCreatorBySlug(params.slug);
          if (creator) {
            return (
              <>
                {!isPreview && <OwnerEditBar slug={params.slug} />}
                <LinkInBioContent creator={creator} />
              </>
            );
          }
        }
      } catch {}
    }
  }

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
      logoUrl: null,
      headerImageUrl: null,
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
      linkBioFontSize: "medium",
      linkBioFontWeight: 400,
      linkBioLetterSpacing: "normal",
      linkBioPagePadding: 16,
      linkBioSectionGap: 16,
      linkBioContainerWidth: "standard",
      linkBioAvatarShape: "circle",
      linkBioAvatarBorderWidth: 0,
      linkBioAvatarBorderColor: "",
      linkBioAvatarShadow: "none",
      linkBioAvatarMode: "photo",
      linkBioButtonFill: "",
      linkBioButtonTextColor: "",
      linkBioButtonBorder: false,
      linkBioButtonBorderWidth: 1,
      linkBioButtonBorderColor: "",
      linkBioButtonShadow: "none",
      linkBioButtonWidth: "standard",
      linkBioGradientDirection: "135deg",
      linkBioGradientColor1: "",
      linkBioGradientColor2: "",
      linkBioBgOverlay: "dark",
      linkBioBgOverlayOpacity: 40,
      linkBioGlassEnabled: false,
      linkBioGlassIntensity: 8,
      linkBioHoverEffect: "none",
      linkBioAnimSpeed: "normal",
      linkBioBlocks: "",
      hideBranding: false,
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
        platform: s.platform || "", handle: s.handle || "",
        followers: s.platform === (autoProfile.platform as string) && followerCount > 0
          ? (followerCount >= 1_000_000 ? `${(followerCount / 1_000_000).toFixed(1)}M` : followerCount >= 1_000 ? `${Math.round(followerCount / 1_000)}K` : String(followerCount))
          : "",
        url: s.url || "",
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
          slug={params.slug}
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
  try { creator = await getCreatorBySlug(params.slug); } catch {}
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

  // Also try case-insensitive user lookup
  try {
    const sql = getDb();
    const users = await sql`SELECT slug FROM users WHERE LOWER(slug) = ${params.slug.toLowerCase()} LIMIT 1`;
    if (users.length > 0) {
      const realCreator = await getCreatorBySlug(users[0].slug as string);
      if (realCreator) {
        const sessionUserId = await getSessionUserId();
        const isOwner = sessionUserId === realCreator.id;
        if (!isOwner) {
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hireacreator.ai"}/api/profile/view?slug=${users[0].slug}`).catch(() => {});
        }
        return (
          <>
            {isOwner && !isPreview && <OwnerEditBar slug={users[0].slug as string} />}
            <LinkInBioContent creator={realCreator} />
          </>
        );
      }
    }
  } catch {}

  // No match found — try auto-creating a profile
  const cleanHandle = params.slug.replace(/^@/, "").trim().toLowerCase();
  if (cleanHandle && cleanHandle.length <= 100 && /^[a-z0-9_.]+$/.test(cleanHandle)) {
    for (const tryPlatform of ["x", "instagram"] as const) {
      try {
        const result = await generateAutoProfile(tryPlatform, cleanHandle);
        if (result && result.profile.avatarUrl) {
          // Profile was created, reload auto profile
          const newAutoProfile = await getAutoProfile(params.slug);
          if (newAutoProfile && !newAutoProfile.claimed_by) {
            const niche = (newAutoProfile.niche as string) || "general";
            const design = designProfile({
              platform: (newAutoProfile.platform as string) || tryPlatform,
              handle: (newAutoProfile.platform_handle as string) || cleanHandle,
              displayName: (newAutoProfile.display_name as string) || cleanHandle,
              avatarUrl: newAutoProfile.avatar_url as string | null,
              bio: newAutoProfile.bio as string | null,
              followerCount: (newAutoProfile.follower_count as number) || 0,
              followingCount: (newAutoProfile.following_count as number) || 0,
              postCount: (newAutoProfile.post_count as number) || 0,
              isVerified: false,
              category: niche,
              externalUrl: null,
              websites: [],
              otherSocials: [],
              profileUrl: "",
              isBusinessAccount: false,
            });

            const autoCreator: Creator = {
              id: newAutoProfile.id as string,
              name: (newAutoProfile.display_name as string) || cleanHandle,
              slug: cleanHandle,
              avatar: newAutoProfile.avatar_url as string | null,
              cover: null,
              logoUrl: null,
              headerImageUrl: null,
              headline: design.suggestedHeadline || null,
              bio: newAutoProfile.bio as string | null,
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
              linkBioTemplate: design.template || "minimal",
              linkBioAccent: "",
              linkBioFont: design.font || "jakarta",
              linkBioTextColor: design.textColor || "",
              linkBioBgType: design.bgType || "gradient",
              linkBioBgValue: design.bgValue || "",
              linkBioBgVideo: "",
              linkBioBgImages: [],
              linkBioButtonShape: design.buttonShape || "soft",
              linkBioButtonAnim: "",
              linkBioCardStyle: "",
              linkBioIntroAnim: "none",
              linkBioTextSize: "",
              linkBioAvatarSize: "",
              linkBioButtonSize: "",
              linkBioContentPosition: "",
              linkBioContentAlign: "",
              linkBioFontSize: "medium",
              linkBioFontWeight: 400,
              linkBioLetterSpacing: "normal",
              linkBioPagePadding: 16,
              linkBioSectionGap: 16,
              linkBioContainerWidth: "standard",
              linkBioAvatarShape: "circle",
              linkBioAvatarBorderWidth: 0,
              linkBioAvatarBorderColor: "",
              linkBioAvatarShadow: "none",
              linkBioAvatarMode: "photo",
              linkBioButtonFill: "",
              linkBioButtonTextColor: "",
              linkBioButtonBorder: false,
              linkBioButtonBorderWidth: 1,
              linkBioButtonBorderColor: "",
              linkBioButtonShadow: "none",
              linkBioButtonWidth: "standard",
              linkBioGradientDirection: "135deg",
              linkBioGradientColor1: "",
              linkBioGradientColor2: "",
              linkBioBgOverlay: "dark",
              linkBioBgOverlayOpacity: 40,
              linkBioGlassEnabled: false,
              linkBioGlassIntensity: 8,
              linkBioHoverEffect: "none",
              linkBioAnimSpeed: "normal",
              linkBioBlocks: "",
              hideBranding: false,
              hasStripeAccount: false,
              calendarEnabled: false,
              profileViews: 0,
              nicheRank: 0,
              creatorScore: (newAutoProfile.creator_score as number) || 0,
              scoreBreakdown: typeof newAutoProfile.score_breakdown === "string"
                ? JSON.parse(newAutoProfile.score_breakdown)
                : newAutoProfile.score_breakdown || {},
              bioLinks: (Array.isArray(newAutoProfile.auto_bio_links) ? newAutoProfile.auto_bio_links : []).map((l: any, i: number) => ({
                id: `auto-bl-${i}`, title: l.title || "", url: l.url || "", thumbnailUrl: null, isVisible: true, isPinned: false, clickCount: 0, sectionName: null, displayStyle: "default",
              })),
              socials: (Array.isArray(newAutoProfile.auto_socials) ? newAutoProfile.auto_socials : []).map((s: any) => ({
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
                <LinkInBioContent creator={autoCreator} isUnclaimed />
                <ClaimBanner
                  platform={tryPlatform}
                  handle={cleanHandle}
                  slug={cleanHandle}
                />
              </>
            );
          }
        }
      } catch {}
    }
  }

  // Final fallback — friendly "not found" page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 p-6">
      <div className="text-center max-w-md space-y-6">
        <div className="text-6xl font-bold text-white/10">?</div>
        <h1 className="text-2xl font-bold text-white">Profile not found</h1>
        <p className="text-gray-400">
          This creator hasn&apos;t been claimed yet.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={`/claim?handle=${encodeURIComponent(params.slug)}`}
            className="inline-block px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition"
          >
            Claim it yourself
          </Link>
          <Link
            href="/browse"
            className="text-gray-400 hover:text-white transition text-sm"
          >
            Or search for creators
          </Link>
        </div>
      </div>
    </div>
  );
}
