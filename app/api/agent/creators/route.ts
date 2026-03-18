import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const auth = await authenticateApiRequest(request, "read");
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const search = (searchParams.get("search") || "").toLowerCase();
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    const sql = getDb();

    let users;
    if (search && category) {
      users = await sql`
        SELECT u.id, u.full_name, u.slug, u.avatar_url, u.cover_url, u.headline, u.bio,
               u.location, u.category, u.hourly_rate, u.rating, u.review_count, u.is_featured,
               u.is_verified, u.is_online
        FROM users u
        WHERE u.role IN ('creator', 'admin', 'brand')
          AND u.visible_in_marketplace = TRUE
          AND (u.is_banned IS NULL OR u.is_banned = FALSE)
          AND u.category = ${category}
          AND (
            LOWER(u.full_name) LIKE ${"%" + search + "%"}
            OR LOWER(u.headline) LIKE ${"%" + search + "%"}
            OR LOWER(u.category) LIKE ${"%" + search + "%"}
          )
        ORDER BY u.is_featured DESC, u.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (search) {
      users = await sql`
        SELECT u.id, u.full_name, u.slug, u.avatar_url, u.cover_url, u.headline, u.bio,
               u.location, u.category, u.hourly_rate, u.rating, u.review_count, u.is_featured,
               u.is_verified, u.is_online
        FROM users u
        WHERE u.role IN ('creator', 'admin', 'brand')
          AND u.visible_in_marketplace = TRUE
          AND (u.is_banned IS NULL OR u.is_banned = FALSE)
          AND (
            LOWER(u.full_name) LIKE ${"%" + search + "%"}
            OR LOWER(u.headline) LIKE ${"%" + search + "%"}
            OR LOWER(u.category) LIKE ${"%" + search + "%"}
          )
        ORDER BY u.is_featured DESC, u.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (category) {
      users = await sql`
        SELECT u.id, u.full_name, u.slug, u.avatar_url, u.cover_url, u.headline, u.bio,
               u.location, u.category, u.hourly_rate, u.rating, u.review_count, u.is_featured,
               u.is_verified, u.is_online
        FROM users u
        WHERE u.role IN ('creator', 'admin', 'brand')
          AND u.visible_in_marketplace = TRUE
          AND (u.is_banned IS NULL OR u.is_banned = FALSE)
          AND u.category = ${category}
        ORDER BY u.is_featured DESC, u.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      users = await sql`
        SELECT u.id, u.full_name, u.slug, u.avatar_url, u.cover_url, u.headline, u.bio,
               u.location, u.category, u.hourly_rate, u.rating, u.review_count, u.is_featured,
               u.is_verified, u.is_online
        FROM users u
        WHERE u.role IN ('creator', 'admin', 'brand')
          AND u.visible_in_marketplace = TRUE
          AND (u.is_banned IS NULL OR u.is_banned = FALSE)
        ORDER BY u.is_featured DESC, u.rating DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // Fetch services for all returned creators
    if (users.length > 0) {
      const userIds = users.map((u: any) => u.id);
      const [socials, services] = await Promise.all([
        sql`SELECT user_id, platform, handle, follower_count FROM social_connections WHERE user_id = ANY(${userIds})`,
        sql`SELECT user_id, id, title, price, currency, delivery_days, category FROM services WHERE user_id = ANY(${userIds}) AND is_active = TRUE`,
      ]);

      const creators = users.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        slug: u.slug,
        avatar_url: u.avatar_url,
        cover_url: u.cover_url,
        headline: u.headline,
        bio: u.bio,
        location: u.location,
        category: u.category,
        hourly_rate: u.hourly_rate,
        rating: Number(u.rating) || 0,
        review_count: u.review_count || 0,
        is_featured: u.is_featured || false,
        is_verified: u.is_verified || false,
        is_online: u.is_online || false,
        public_url: u.slug ? `https://hireacreator.ai/${u.slug}` : null,
        socials: socials
          .filter((s: any) => s.user_id === u.id)
          .map((s: any) => ({ platform: s.platform, handle: s.handle, followers: s.follower_count || 0 })),
        services: services
          .filter((s: any) => s.user_id === u.id)
          .map((s: any) => ({
            id: s.id,
            title: s.title,
            price: s.price,
            currency: s.currency || "USD",
            delivery_days: s.delivery_days,
            category: s.category,
          })),
      }));

      return NextResponse.json({
        creators,
        count: creators.length,
        limit,
        offset,
      });
    }

    return NextResponse.json({ creators: [], count: 0, limit, offset });
  } catch (err: any) {
    console.error("[Agent Creators GET Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch creators." },
      { status: 500 }
    );
  }
}
