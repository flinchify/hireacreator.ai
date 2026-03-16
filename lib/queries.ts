import { getDb } from "./db";
import type { Creator, Social, Service, PortfolioItem, Review } from "./types";

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
  reviews: Record<string, unknown>[] = []
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
  };
}

export async function getCreators(): Promise<Creator[]> {
  const sql = getDb();
  const users = await sql`
    SELECT * FROM users
    WHERE role = 'creator' AND visible_in_marketplace = TRUE
    ORDER BY is_featured DESC, rating DESC
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
    WHERE role = 'creator' AND is_featured = TRUE AND visible_in_marketplace = TRUE
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
    SELECT * FROM users WHERE slug = ${slug} AND role = 'creator' LIMIT 1
  `;

  if (users.length === 0) return null;
  const user = users[0];

  const [socials, services, portfolio, reviewRows] = await Promise.all([
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
  ]);

  return assembleCreator(user, socials, services, portfolio, reviewRows);
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

export async function getCreatorCount(): Promise<number> {
  const sql = getDb();
  const result = await sql`SELECT COUNT(*) as count FROM users WHERE role = 'creator'`;
  return Number(result[0].count);
}
