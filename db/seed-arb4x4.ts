import { getDb } from "../lib/db";

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const head = html.substring(0, Math.min(html.indexOf("</head>") + 7, 100000));
    const ogMatch = head.match(/property=["']og:image["']\s*content=["']([^"']+)["']/i)
      || head.match(/content=["']([^"']+)["']\s*property=["']og:image["']/i);
    return ogMatch ? ogMatch[1] : null;
  } catch { return null; }
}

function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

async function run() {
  const sql = getDb();

  // Check if already exists
  const existing = await sql`SELECT id FROM users WHERE slug = 'arb4x4'`;
  if (existing.length > 0) {
    console.log("ARB 4x4 profile already exists, updating...");
    await sql`DELETE FROM bio_links WHERE user_id = ${existing[0].id}`;
    await sql`DELETE FROM social_connections WHERE user_id = ${existing[0].id}`;
    await sql`DELETE FROM users WHERE id = ${existing[0].id}`;
  }

  // Insert user
  const users = await sql`
    INSERT INTO users (email, full_name, slug, headline, bio, location, category, role, visible_in_marketplace,
      avatar_url, link_bio_template, link_bio_accent, link_bio_bg_type, link_bio_button_shape)
    VALUES (
      'demo@arb.com.au', 'ARB 4x4 Accessories', 'arb4x4',
      'Your partner in adventure since 1975.',
      'ARB 4x4 Australia. Premium 4WD accessories, bull bars, suspension, camping gear, and recovery equipment. Built for the Australian outback.',
      'Melbourne, Australia', 'Automotive', 'creator', true,
      'https://yt3.googleusercontent.com/ytc/AIdro_nT9VfM_m0x6bK5S3F4YVpYYz7fhUkMkGxJUWuK=s176-c-k-c0x00ffffff-no-rj',
      'minimal', '#d32f2f', 'gradient', 'rounded'
    )
    RETURNING id
  `;
  const userId = users[0].id;
  console.log("Created ARB 4x4 user:", userId);

  // Links
  const links = [
    { title: "Weekends Are Calling...", url: "https://arb.com.au/weekends", position: 0 },
    { title: "ARB Home Page", url: "https://www.arb.com.au", position: 1 },
    { title: "ARB Accessories for the Ford Super Duty!", url: "https://www.youtube.com/watch?v=1JwpLak9rCY", position: 2 },
    { title: "ARB 50th Anniversary Series", url: "https://youtube.com/playlist?list=PL835UyMZLOIUVEuYxzZSasKGSwXnz76mN", position: 3 },
    { title: "Shop Intrepid", url: "https://www.arb.com.au/intrepid", position: 4 },
    { title: "Shop Bull Bars", url: "https://www.arb.com.au/products/4x4-protection/bull-bars", position: 5 },
    { title: "Shop Old Man Emu Suspension", url: "https://www.arb.com.au/products/old-man-emu-suspension/old-man-emu-suspension-kits", position: 6 },
    { title: "Shop Camping & Touring", url: "https://www.arb.com.au/products/camping-and-touring", position: 7 },
    { title: "Shop Driving Lights", url: "https://www.arb.com.au/products/electrical-and-lighting/driving-lights", position: 8 },
    { title: "Shop Recovery Equipment", url: "https://www.arb.com.au/products/recovery-equipment", position: 9 },
    { title: "Gift Cards & Merchandise", url: "https://www.arb.com.au/products/gift-cards-apparel-merchandise", position: 10 },
    { title: "4x4 Culture Issue 68", url: "https://view.publitas.com/arb-4x4-accessories-1/4x4-culture-issue-68/page/1", position: 11 },
    { title: "4x4 Culture Issue 67", url: "https://view.publitas.com/arb-4x4-accessories-1/4x4-culture-issue-67/", position: 12 },
  ];

  for (const link of links) {
    let thumbnail: string | null = getYouTubeThumbnail(link.url);
    if (!thumbnail) {
      console.log(`  Fetching OG image for: ${link.title}...`);
      thumbnail = await fetchOgImage(link.url);
    }
    await sql`
      INSERT INTO bio_links (user_id, title, url, thumbnail_url, position, is_visible, is_pinned, click_count)
      VALUES (${userId}, ${link.title}, ${link.url}, ${thumbnail}, ${link.position}, true, false, 0)
    `;
    console.log(`  Added: ${link.title} ${thumbnail ? "(with thumbnail)" : "(no thumbnail)"}`);
  }

  // Socials
  await sql`INSERT INTO social_connections (user_id, platform, handle, url, follower_count) VALUES
    (${userId}, 'instagram', 'arb4x4', 'https://www.instagram.com/arb4x4/', 250000),
    (${userId}, 'youtube', 'ARB4x4', 'https://www.youtube.com/@ARB4x4', 100000),
    (${userId}, 'tiktok', 'arb4x4', 'https://www.tiktok.com/@arb4x4', 50000)
  `;
  console.log("Added 3 social connections");

  console.log("\nDone! View at: hireacreator.ai/u/arb4x4");
  process.exit(0);
}

run().catch(console.error);
