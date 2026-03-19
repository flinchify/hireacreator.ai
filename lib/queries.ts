// v2 - force redeploy
import { getDb } from "./db";
import type { Creator, Social, Service, PortfolioItem, Review, Product, Testimonial, ServicePackage, PortfolioTemplateType } from "./types";

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

function assembleCreator(
  user: Record<string, unknown>,
  socials: Record<string, unknown>[] = [],
  services: Record<string, unknown>[] = [],
  portfolio: Record<string, unknown>[] = [],
  reviews: Record<string, unknown>[] = [],
  bioLinks: Record<string, unknown>[] = [],
  products: Record<string, unknown>[] = [],
  servicePackages: Record<string, unknown>[] = [],
  testimonials: Record<string, unknown>[] = []
): Creator {
  return {
    id: user.id as string,
    name: user.full_name as string,
    slug: user.slug as string,
    avatar: (user.avatar_url as string) || null,
    cover: (user.cover_url as string) || null,
    headline: (user.headline as string) || null,
    bio: (user.bio as string) || null,
    location: (user.location as string) || null,
    category: (user.category as string) || null,
    hourlyRate: user.hourly_rate as number | null,
    rating: Number(user.rating) || 0,
    reviewCount: (user.review_count as number) || 0,
    totalProjects: (user.total_projects as number) || 0,
    isVerified: (user.verification_status === "verified") || (user.is_verified as boolean) || false,
    isFeatured: (user.is_featured as boolean) || false,
    isOnline: (user.is_online as boolean) || false,
    isPro: ((user.subscription_tier as string) || "free") !== "free",
    subscriptionTier: (user.subscription_tier as string) || "free",
    visibleInMarketplace: user.visible_in_marketplace !== false,
    websiteUrl: (user.website_url as string) || null,
    businessName: (user.business_name as string) || null,
    businessUrl: (user.business_url as string) || null,
    allowMessages: user.privacy_allow_messages !== false,
    is18PlusContent: (user.is_18_plus_content as boolean) || false,
    linkBioTemplate: (user.link_bio_template as string) || "minimal",
    linkBioAccent: (user.link_bio_accent as string) || "#171717",
    linkBioFont: (user.link_bio_font as string) || "jakarta",
    linkBioTextColor: (user.link_bio_text_color as string) || "",
    linkBioBgType: (user.link_bio_bg_type as string) || "",
    linkBioBgValue: (user.link_bio_bg_value as string) || "",
    linkBioBgVideo: (user.link_bio_bg_video as string) || "",
    linkBioBgImages: (() => { try { const v = user.link_bio_bg_images as string; return v ? JSON.parse(v) : []; } catch { return []; } })(),
    linkBioButtonShape: (user.link_bio_button_shape as string) || "rounded",
    linkBioButtonAnim: (user.link_bio_button_anim as string) || "none",
    linkBioCardStyle: (user.link_bio_card_style as string) || "default",
    linkBioIntroAnim: (user.link_bio_intro_anim as string) || "none",
    linkBioTextSize: (user.link_bio_text_size as string) || "medium",
    linkBioAvatarSize: (user.link_bio_avatar_size as string) || "medium",
    linkBioButtonSize: (user.link_bio_button_size as string) || "medium",
    hasStripeAccount: !!(user.stripe_account_id as string),
    calendarEnabled: (user.calendar_enabled as boolean) || false,
    profileViews: (user.profile_views as number) || 0,
    nicheRank: (user.niche_rank as number) || 0,
    creatorScore: (user.creator_score as number) || 0,
    scoreBreakdown: (() => { try { const v = user.score_breakdown; return typeof v === "string" ? JSON.parse(v) : (v || {}); } catch { return {}; } })(),
    bioLinks: bioLinks.map((l) => ({
      id: l.id as string,
      title: l.title as string,
      url: l.url as string,
      thumbnailUrl: (l.thumbnail_url as string) || null,
      isVisible: l.is_visible !== false,
      isPinned: (l.is_pinned as boolean) || false,
      clickCount: (l.click_count as number) || 0,
    })),
    socials: socials.map((s) => ({
      platform: s.platform as string,
      handle: s.handle as string,
      followers: formatFollowers((s.follower_count as number) || 0),
      url: (s.url as string) || undefined,
      followersRefreshedAt: (s.followers_refreshed_at as string) || null,
    })),
    services: services.map((s) => {
      const pkgs = servicePackages.filter((p) => p.service_id === s.id);
      const mapped: Service = {
        id: s.id as string,
        title: s.title as string,
        description: (s.description as string) || "",
        price: s.price as number,
        deliveryDays: (s.delivery_days as number) || 7,
      };
      if (pkgs.length > 0) {
        mapped.packages = pkgs.map((p) => ({
          id: p.id as string,
          tier: p.tier as "basic" | "standard" | "premium",
          title: p.title as string,
          price: p.price as number,
          deliveryDays: (p.delivery_days as number) || 7,
          revisions: (p.revisions as number) || 1,
          features: (() => { try { const v = p.features; return Array.isArray(v) ? v : typeof v === "string" ? JSON.parse(v) : []; } catch { return []; } })(),
        }));
      }
      return mapped;
    }),
    portfolio: portfolio.map((p) => ({
      id: p.id as string,
      title: p.title as string,
      image: (p.image_url as string) || "",
      video: (p.video_url as string) || undefined,
      category: (p.category as string) || "",
      mediaType: ((p.media_type as string) || "image") as "image" | "video",
      templateType: ((p.template_type as string) || "standard") as PortfolioTemplateType,
      templateData: (() => { try { const v = p.template_data; return typeof v === "string" ? JSON.parse(v) : (v || {}); } catch { return {}; } })(),
    })),
    reviews: reviews.map((r) => ({
      id: r.id as string,
      name: r.reviewer_name as string,
      avatar: (r.reviewer_avatar as string) || "",
      rating: r.rating as number,
      comment: (r.comment as string) || "",
      date: r.created_at
        ? new Date(r.created_at as string).toISOString().split("T")[0]
        : "",
    })),
    products: products.map((p) => ({
      id: p.id as string,
      title: p.title as string,
      description: (p.description as string) || null,
      priceCents: (p.price_cents as number) || 0,
      currency: (p.currency as string) || "AUD",
      productUrl: (p.product_url as string) || null,
      thumbnailUrl: (p.thumbnail_url as string) || null,
      productType: (p.product_type as string) || "digital",
      isActive: p.is_active !== false,
      sortOrder: (p.sort_order as number) || 0,
    })),
    testimonials: testimonials.map((t) => ({
      id: t.id as string,
      clientName: t.client_name as string,
      clientCompany: (t.client_company as string) || null,
      clientAvatar: (t.client_avatar as string) || null,
      content: t.content as string,
      rating: (t.rating as number) || null,
      source: (t.source as string) || null,
      screenshotUrl: (t.screenshot_url as string) || null,
      displayOrder: (t.display_order as number) || 0,
      isVisible: t.is_visible !== false,
    })),
  };
}

export async function getCreators(): Promise<Creator[]> {
  const sql = getDb();
  const users = await sql`
    SELECT u.* FROM users u
    WHERE u.role IN ('creator', 'admin', 'brand')
      AND u.visible_in_marketplace = TRUE
      AND (u.is_banned IS NULL OR u.is_banned = FALSE)
      AND u.email_verified = TRUE
      AND (u.avatar_url IS NOT NULL OR u.role = 'brand')
      AND (EXISTS (SELECT 1 FROM social_connections sc WHERE sc.user_id = u.id) OR u.role = 'brand')
    ORDER BY u.is_featured DESC, u.rating DESC
  `;

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const socials = await sql`
    SELECT * FROM social_connections WHERE user_id = ANY(${userIds})
  `;

  return users.map((user) =>
    assembleCreator(
      user,
      socials.filter((s) => s.user_id === user.id)
    )
  );
}

export async function getFeaturedCreators(): Promise<Creator[]> {
  const sql = getDb();
  const users = await sql`
    SELECT * FROM users
    WHERE role IN ('creator', 'admin', 'brand') AND is_featured = TRUE AND visible_in_marketplace = TRUE
      AND (is_banned IS NULL OR is_banned = FALSE)
    ORDER BY rating DESC
    LIMIT 4
  `;

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const socials = await sql`
    SELECT * FROM social_connections WHERE user_id = ANY(${userIds})
  `;

  return users.map((user) =>
    assembleCreator(
      user,
      socials.filter((s) => s.user_id === user.id)
    )
  );
}

export async function getCreatorBySlug(
  slug: string
): Promise<Creator | null> {
  const sql = getDb();
  const users = await sql`
    SELECT * FROM users WHERE slug = ${slug} AND role IN ('creator', 'admin', 'brand') LIMIT 1
  `;

  if (users.length === 0) return null;
  const user = users[0];

  const [socials, services, portfolio, reviewRows, bioLinks, products, servicePackages, testimonials] = await Promise.all([
    sql`SELECT * FROM social_connections WHERE user_id = ${user.id}`,
    sql`SELECT * FROM services WHERE user_id = ${user.id} AND is_active = TRUE ORDER BY price ASC`,
    sql`SELECT * FROM portfolio_items WHERE user_id = ${user.id} ORDER BY sort_order ASC`,
    sql`
      SELECT r.*, u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.creator_id = ${user.id}
      ORDER BY r.created_at DESC
    `,
    sql`SELECT * FROM bio_links WHERE user_id = ${user.id} AND is_visible = TRUE AND (is_archived = FALSE OR is_archived IS NULL) ORDER BY position ASC`,
    sql`SELECT * FROM creator_products WHERE user_id = ${user.id} AND is_active = TRUE ORDER BY sort_order ASC`,
    sql`SELECT sp.* FROM service_packages sp JOIN services s ON s.id = sp.service_id WHERE s.user_id = ${user.id} AND s.is_active = TRUE ORDER BY CASE sp.tier WHEN 'basic' THEN 0 WHEN 'standard' THEN 1 WHEN 'premium' THEN 2 END`,
    sql`SELECT * FROM testimonials WHERE user_id = ${user.id} AND is_visible = TRUE ORDER BY display_order ASC, created_at DESC`,
  ]);

  return assembleCreator(user, socials, services, portfolio, reviewRows, bioLinks, products, servicePackages, testimonials);
}

export async function searchCreators(filters?: {
  query?: string;
  category?: string;
}): Promise<Creator[]> {
  const sql = getDb();
  const query = filters?.query?.toLowerCase() || "";
  const category = filters?.category || "";

  let users;
  if (query && category) {
    users = await sql`
      SELECT * FROM users
      WHERE role = 'creator' AND visible_in_marketplace = TRUE
        AND category = ${category}
        AND (
          LOWER(full_name) LIKE ${"%" + query + "%"}
          OR LOWER(headline) LIKE ${"%" + query + "%"}
          OR LOWER(category) LIKE ${"%" + query + "%"}
        )
      ORDER BY is_featured DESC, rating DESC
    `;
  } else if (query) {
    users = await sql`
      SELECT * FROM users
      WHERE role = 'creator' AND visible_in_marketplace = TRUE
        AND (
          LOWER(full_name) LIKE ${"%" + query + "%"}
          OR LOWER(headline) LIKE ${"%" + query + "%"}
          OR LOWER(category) LIKE ${"%" + query + "%"}
        )
      ORDER BY is_featured DESC, rating DESC
    `;
  } else if (category) {
    users = await sql`
      SELECT * FROM users
      WHERE role = 'creator' AND visible_in_marketplace = TRUE AND category = ${category}
      ORDER BY is_featured DESC, rating DESC
    `;
  } else {
    users = await sql`
      SELECT * FROM users
      WHERE role = 'creator' AND visible_in_marketplace = TRUE
      ORDER BY is_featured DESC, rating DESC
    `;
  }

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const socials = await sql`
    SELECT * FROM social_connections WHERE user_id = ANY(${userIds})
  `;

  return users.map((user) =>
    assembleCreator(
      user,
      socials.filter((s) => s.user_id === user.id)
    )
  );
}

export async function getTopCreatorsByCategory(): Promise<Record<string, Creator[]>> {
  const sql = getDb();
  const users = await sql`
    SELECT * FROM users
    WHERE role IN ('creator', 'admin') AND visible_in_marketplace = TRUE
      AND (is_banned IS NULL OR is_banned = FALSE)
      AND email_verified = TRUE
      AND category IS NOT NULL AND category != ''
    ORDER BY profile_views DESC NULLS LAST, rating DESC
  `;

  if (users.length === 0) return {};

  const userIds = users.map((u) => u.id);
  const socials = await sql`
    SELECT * FROM social_connections WHERE user_id = ANY(${userIds})
  `;

  const byCategory: Record<string, Creator[]> = {};
  for (const user of users) {
    const cat = user.category as string;
    if (!cat) continue;
    if (!byCategory[cat]) byCategory[cat] = [];
    if (byCategory[cat].length < 3) {
      byCategory[cat].push(
        assembleCreator(user, socials.filter((s) => s.user_id === user.id))
      );
    }
  }
  return byCategory;
}

export async function getCreatorCalendarSessions(userId: string) {
  const sql = getDb();
  const sessions = await sql`
    SELECT id, title, duration_min, price, description
    FROM calendar_sessions
    WHERE user_id = ${userId} AND is_active = TRUE
    ORDER BY price ASC
  `;
  return sessions as { id: string; title: string; duration_min: number; price: number; description: string | null }[];
}

export async function getCreatorTestimonials(userId: string) {
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM testimonials
    WHERE user_id = ${userId} AND is_visible = TRUE
    ORDER BY display_order ASC, created_at DESC
  `;
  return rows.map((t) => ({
    id: t.id as string,
    clientName: t.client_name as string,
    clientCompany: (t.client_company as string) || null,
    clientAvatar: (t.client_avatar as string) || null,
    content: t.content as string,
    rating: (t.rating as number) || null,
    source: (t.source as string) || null,
    screenshotUrl: (t.screenshot_url as string) || null,
    displayOrder: (t.display_order as number) || 0,
    isVisible: true,
  }));
}

export async function getCreatorCount(): Promise<number> {
  const sql = getDb();
  const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'creator'`;
  return Number(result[0].count);
}

export async function getFeaturedCreatorsRotation(): Promise<Creator[]> {
  try {
    const sql = getDb();

    // Get current week boundaries (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const wsStr = weekStart.toISOString().split("T")[0];
    const weStr = weekEnd.toISOString().split("T")[0];

    // 1. Check for existing rotation this week
    const existing = await sql`
      SELECT fr.creator_id FROM featured_rotations fr
      WHERE fr.week_start = ${wsStr}
      ORDER BY fr.position ASC
    `;

    if (existing.length > 0) {
      const ids = existing.map((r) => r.creator_id);
      const users = await sql`
        SELECT * FROM users WHERE id = ANY(${ids})
          AND (is_banned IS NULL OR is_banned = FALSE)
      `;
      if (users.length > 0) {
        const userIds = users.map((u) => u.id);
        const socials = await sql`SELECT * FROM social_connections WHERE user_id = ANY(${userIds})`;
        // Maintain position order
        const userMap = new Map(users.map((u) => [u.id, u]));
        return ids
          .filter((id) => userMap.has(id))
          .map((id) => assembleCreator(userMap.get(id)!, socials.filter((s) => s.user_id === id)));
      }
    }

    // 2. Auto-select 4 creators based on profile completeness, verification, recency, randomness
    const candidates = await sql`
      SELECT u.*,
        (CASE WHEN u.bio IS NOT NULL AND u.bio != '' THEN 1 ELSE 0 END
         + CASE WHEN u.avatar_url IS NOT NULL THEN 1 ELSE 0 END
         + CASE WHEN EXISTS (SELECT 1 FROM services s WHERE s.user_id = u.id AND s.is_active = TRUE) THEN 1 ELSE 0 END
         + CASE WHEN EXISTS (SELECT 1 FROM social_connections sc WHERE sc.user_id = u.id) THEN 1 ELSE 0 END
         + CASE WHEN u.verification_status = 'verified' THEN 2 ELSE 0 END
        ) AS completeness_score,
        (SELECT MAX(fr.week_start) FROM featured_rotations fr WHERE fr.creator_id = u.id) AS last_featured
      FROM users u
      WHERE u.role IN ('creator', 'admin')
        AND u.visible_in_marketplace = TRUE
        AND (u.is_banned IS NULL OR u.is_banned = FALSE)
        AND u.avatar_url IS NOT NULL
      ORDER BY completeness_score DESC, last_featured ASC NULLS FIRST, RANDOM()
      LIMIT 4
    `;

    if (candidates.length === 0) {
      // Fallback to old getFeaturedCreators behavior
      return getFeaturedCreators();
    }

    // 3. Insert into featured_rotations
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      await sql`
        INSERT INTO featured_rotations (creator_id, week_start, week_end, position, reason)
        VALUES (${c.id}, ${wsStr}, ${weStr}, ${i}, 'auto-selected')
        ON CONFLICT (creator_id, week_start) DO NOTHING
      `;
    }

    const userIds = candidates.map((u) => u.id);
    const socials = await sql`SELECT * FROM social_connections WHERE user_id = ANY(${userIds})`;
    return candidates.map((user) =>
      assembleCreator(user, socials.filter((s) => s.user_id === user.id))
    );
  } catch (e) {
    console.error('[getFeaturedCreatorsRotation] Error:', e);
    try {
      return await getFeaturedCreators();
    } catch {
      return [];
    }
  }
}
