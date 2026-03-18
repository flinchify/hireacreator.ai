import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getDb } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const auth = await authenticateApiRequest(request, "read");
    if (!auth.ok) return auth.response;

    const { slug } = params;
    if (!slug) {
      return NextResponse.json(
        { error: "missing_slug", message: "Creator slug is required." },
        { status: 400 }
      );
    }

    const sql = getDb();
    const users = await sql`
      SELECT * FROM users WHERE slug = ${slug} AND role IN ('creator', 'admin', 'brand') LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "creator_not_found", message: "No creator found with this slug." },
        { status: 404 }
      );
    }

    const user = users[0];
    const [socials, services, portfolio, reviews] = await Promise.all([
      sql`SELECT id, platform, handle, url, follower_count, is_verified FROM social_connections WHERE user_id = ${user.id}`,
      sql`SELECT id, title, description, price, currency, delivery_days, category FROM services WHERE user_id = ${user.id} AND is_active = TRUE ORDER BY price ASC`,
      sql`SELECT id, title, image_url, video_url, category, media_type FROM portfolio_items WHERE user_id = ${user.id} ORDER BY sort_order ASC`,
      sql`
        SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS reviewer_name
        FROM reviews r
        JOIN users u ON u.id = r.reviewer_id
        WHERE r.creator_id = ${user.id}
        ORDER BY r.created_at DESC
        LIMIT 50
      `,
    ]);

    return NextResponse.json({
      creator: {
        id: user.id,
        name: user.full_name,
        slug: user.slug,
        avatar_url: user.avatar_url,
        cover_url: user.cover_url,
        headline: user.headline,
        bio: user.bio,
        location: user.location,
        category: user.category,
        hourly_rate: user.hourly_rate,
        rating: Number(user.rating) || 0,
        review_count: user.review_count || 0,
        is_featured: user.is_featured || false,
        is_verified: user.is_verified || false,
        is_online: user.is_online || false,
        website_url: user.website_url,
        public_url: `https://hireacreator.ai/${user.slug}`,
      },
      socials: socials.map((s: any) => ({
        id: s.id,
        platform: s.platform,
        handle: s.handle,
        url: s.url,
        followers: s.follower_count || 0,
        is_verified: s.is_verified || false,
      })),
      services: services.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        currency: s.currency || "USD",
        delivery_days: s.delivery_days,
        category: s.category,
      })),
      portfolio: portfolio.map((p: any) => ({
        id: p.id,
        title: p.title,
        image_url: p.image_url,
        video_url: p.video_url,
        category: p.category,
        media_type: p.media_type || "image",
      })),
      reviews: reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        reviewer_name: r.reviewer_name,
        date: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : null,
      })),
    });
  } catch (err: any) {
    console.error("[Agent Creator Detail Error]", err);
    return NextResponse.json(
      { error: "internal_error", message: "Failed to fetch creator details." },
      { status: 500 }
    );
  }
}
