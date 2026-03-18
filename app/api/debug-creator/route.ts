export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getCreatorBySlug } from "@/lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "milesrunsai";
  
  try {
    // Direct DB query to compare
    const sql = getDb();
    const users = await sql`SELECT id, full_name, link_bio_template FROM users WHERE slug = ${slug} LIMIT 1`;
    if (users.length === 0) return NextResponse.json({ error: "user not found in DB" });
    const uid = users[0].id;
    
    const rawLinks = await sql`SELECT id, title, url, is_visible, is_archived FROM bio_links WHERE user_id = ${uid}`;
    const filteredLinks = await sql`SELECT id, title FROM bio_links WHERE user_id = ${uid} AND is_visible = TRUE AND (is_archived = FALSE OR is_archived IS NULL) ORDER BY position ASC`;
    
    // Also get via getCreatorBySlug
    const creator = await getCreatorBySlug(slug);
    
    return NextResponse.json({
      directDb: {
        userId: uid,
        name: users[0].full_name,
        template: users[0].link_bio_template,
        rawLinksCount: rawLinks.length,
        rawLinks: rawLinks,
        filteredLinksCount: filteredLinks.length,
        filteredLinks: filteredLinks,
      },
      viaGetCreator: creator ? {
        name: creator.name,
        template: creator.linkBioTemplate,
        bioLinksCount: creator.bioLinks.length,
        bioLinks: creator.bioLinks,
        calendarEnabled: creator.calendarEnabled,
        socialsCount: creator.socials.length,
      } : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.split("\n").slice(0, 5) });
  }
}
