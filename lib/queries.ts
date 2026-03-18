// v2 - force redeploy
import { getDb } from "./db";
import type { Creator, Social, Service, PortfolioItem, Review, Product } from "./types";

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
  products: Record<string, unknown>[] = []
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
    isVerified: (user.is_verified as boolean) || false,
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
    calendarEnabled: (user.calendar_enabled as boolean) || false,
    profileViews: (user.profile_views as number) || 0,
    nicheRank: (user.niche_rank as number) || 0,
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
    })),
    services: services.map((s) => ({
      id: s.id as string,
      title: s.title as string,
      description: (s.description as string) || "",
      price: s.price as number,
      deliveryDays: (s.delivery_days as number) || 7,
    })),
    portfolio: portfolio.map((p) => ({
      id: p.id as string,
      title: p.title as string,
      image: (p.image_url as string) || "",
      video: (p.video_url as string) || undefined,
      category: (p.category as string) || "",
      mediaType: ((p.media_type as string) || "image") as "image" | "video",
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

  const [socials, services, portfolio, reviewRows, bioLinks, products] = await Promise.all([
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
  ]);

  return assembleCreator(user, socials, services, portfolio, reviewRows, bioLinks, products);
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

export async function getCreatorCount(): Promise<number> {
  const sql = getDb();
  const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'creator'`;
  return Number(result[0].count);
}
