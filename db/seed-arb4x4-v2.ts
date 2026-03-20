import { getDb } from "../lib/db";

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { 
      signal: controller.signal, 
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow"
    });
    const html = await res.text();
    const head = html.substring(0, Math.min(html.indexOf("</head>") + 7 || 100000, 100000));
    const ogMatch = head.match(/property=["']og:image["']\s*content=["']([^"']+)["']/i)
      || head.match(/content=["']([^"']+)["']\s*property=["']og:image["']/i)
      || head.match(/name=["']twitter:image["']\s*content=["']([^"']+)["']/i);
    return ogMatch ? ogMatch[1] : null;
  } catch { return null; }
}

async function run() {
  const sql = getDb();

  // Delete existing
  const existing = await sql`SELECT id FROM users WHERE slug = 'arb4x4'`;
  if (existing.length > 0) {
    const uid = existing[0].id;
    await sql`DELETE FROM bio_links WHERE user_id = ${uid}`;
    await sql`DELETE FROM social_connections WHERE user_id = ${uid}`;
    await sql`DELETE FROM services WHERE user_id = ${uid}`;
    await sql`DELETE FROM creator_products WHERE user_id = ${uid}`;
    await sql`DELETE FROM profile_views WHERE creator_id = ${uid}`;
    await sql`DELETE FROM link_clicks WHERE creator_id = ${uid}`;
    await sql`DELETE FROM enquiry_log WHERE creator_id = ${uid}`;
    await sql`DELETE FROM auth_sessions WHERE user_id = ${uid}`;
    await sql`DELETE FROM creator_stars WHERE user_id = ${uid} OR creator_id = ${uid}`;
    await sql`DELETE FROM testimonials WHERE user_id = ${uid}`;
    await sql`DELETE FROM reply_templates WHERE user_id = ${uid}`;
    await sql`DELETE FROM users WHERE id = ${uid}`;
    console.log("Deleted old ARB 4x4 profile");
  }

  // Create user with dark theme styling
  const users = await sql`
    INSERT INTO users (
      email, full_name, slug, headline, bio, location, category, role, 
      visible_in_marketplace, avatar_url, cover_url,
      link_bio_template, link_bio_accent, link_bio_bg_type, link_bio_bg_value,
      link_bio_button_shape, link_bio_font, link_bio_text_color, link_bio_text_size
    ) VALUES (
      'demo@arb.com.au', 'ARB 4x4 Accessories', 'arb4x4',
      'Your partner in adventure since 1975.',
      'ARB 4x4 Australia. Premium 4WD accessories, bull bars, suspension, camping gear, and recovery equipment. Built for the Australian outback.',
      'Melbourne, Australia', 'Automotive', 'creator', true,
      'https://yt3.googleusercontent.com/ytc/AIdro_nT9VfM_m0x6bK5S3F4YVpYYz7fhUkMkGxJUWuK=s176-c-k-c0x00ffffff-no-rj',
      'https://www.arb.com.au/media/wysiwyg/Homepage-Banners/OME-Triton-HP-banner-desktop.jpg',
      'bold', '#d32f2f', 'solid', '#1a1a1a',
      'rounded', 'inter', '#ffffff', 'medium'
    )
    RETURNING id
  `;
  const userId = users[0].id;
  console.log("Created ARB 4x4 user:", userId);

  // Links with thumbnails and sections
  const links: { title: string; url: string; thumbnail: string | null; position: number; section: string | null }[] = [
    // Standalone links (no section)
    {
      title: "Weekends Are Calling...",
      url: "https://arb.com.au/weekends",
      thumbnail: "https://www.arb.com.au/media/wysiwyg/Homepage-Banners/Weekends-Are-Calling-HP-Banner.jpg",
      position: 0,
      section: null
    },
    {
      title: "ARB Home Page",
      url: "https://www.arb.com.au",
      thumbnail: "https://www.arb.com.au/media/wysiwyg/Homepage-Banners/OME-Triton-HP-banner-desktop.jpg",
      position: 1,
      section: null
    },
    // YouTube Videos section
    {
      title: "ARB Accessories for the Ford Super Duty!",
      url: "https://www.youtube.com/watch?v=1JwpLak9rCY",
      thumbnail: "https://img.youtube.com/vi/1JwpLak9rCY/hqdefault.jpg",
      position: 2,
      section: "Youtube Videos"
    },
    {
      title: "ARB 50th Anniversary Series | Watch now!",
      url: "https://youtube.com/playlist?list=PL835UyMZLOIUVEuYxzZSasKGSwXnz76mN",
      thumbnail: "https://img.youtube.com/vi/PL835UyMZLO/hqdefault.jpg",
      position: 3,
      section: "Youtube Videos"
    },
    // Shop ARB section
    {
      title: "Shop Intrepid",
      url: "https://www.arb.com.au/intrepid",
      thumbnail: null,
      position: 4,
      section: "Shop ARB"
    },
    {
      title: "Shop Bull Bars",
      url: "https://www.arb.com.au/products/4x4-protection/bull-bars",
      thumbnail: null,
      position: 5,
      section: "Shop ARB"
    },
    {
      title: "Shop Old Man Emu Suspension Kits",
      url: "https://www.arb.com.au/products/old-man-emu-suspension/old-man-emu-suspension-kits",
      thumbnail: null,
      position: 6,
      section: "Shop ARB"
    },
    {
      title: "Shop Back of Ute",
      url: "https://www.arb.com.au/products/back-of-ute",
      thumbnail: null,
      position: 7,
      section: "Shop ARB"
    },
    {
      title: "Shop Driving Lights",
      url: "https://www.arb.com.au/products/electrical-and-lighting/driving-lights",
      thumbnail: null,
      position: 8,
      section: "Shop ARB"
    },
    {
      title: "Shop Camping & Touring",
      url: "https://www.arb.com.au/products/camping-and-touring",
      thumbnail: null,
      position: 9,
      section: "Shop ARB"
    },
    {
      title: "Shop ARB Air Lockers",
      url: "https://www.arb.com.au/products/drivetrain-performance/arb-air-lockers",
      thumbnail: null,
      position: 10,
      section: "Shop ARB"
    },
    {
      title: "Shop Air Compressors & Accessories",
      url: "https://www.arb.com.au/products/air-compressors-tyre-accessories",
      thumbnail: null,
      position: 11,
      section: "Shop ARB"
    },
    {
      title: "Gift Cards, Apparel & Merchandise",
      url: "https://www.arb.com.au/products/gift-cards-apparel-merchandise",
      thumbnail: null,
      position: 12,
      section: "Shop ARB"
    },
    {
      title: "Shop Roof Racks & BASE Racks",
      url: "https://www.arb.com.au/products/roof-racks-and-base-racks",
      thumbnail: null,
      position: 13,
      section: "Shop ARB"
    },
    {
      title: "Shop Recovery Equipment",
      url: "https://www.arb.com.au/products/recovery-equipment",
      thumbnail: null,
      position: 14,
      section: "Shop ARB"
    },
    // 4x4 Culture section
    {
      title: "4x4 Culture Issue 68",
      url: "https://view.publitas.com/arb-4x4-accessories-1/4x4-culture-issue-68/page/1",
      thumbnail: null,
      position: 15,
      section: "4x4 Culture"
    },
    {
      title: "4x4 Culture Issue 67",
      url: "https://view.publitas.com/arb-4x4-accessories-1/4x4-culture-issue-67/",
      thumbnail: null,
      position: 16,
      section: "4x4 Culture"
    },
  ];

  // Try fetching OG images for links without thumbnails
  for (const link of links) {
    if (!link.thumbnail) {
      console.log(`  Fetching OG for: ${link.title}...`);
      link.thumbnail = await fetchOgImage(link.url);
    }
    const displayStyle = link.section ? "slide" : "button";
    await sql`
      INSERT INTO bio_links (user_id, title, url, thumbnail_url, position, is_visible, is_pinned, click_count, section_name, display_style)
      VALUES (${userId}, ${link.title}, ${link.url}, ${link.thumbnail}, ${link.position}, true, false, 0, ${link.section}, ${displayStyle})
    `;
    console.log(`  + ${link.title} ${link.thumbnail ? "(thumb)" : ""} ${link.section ? `[${link.section}]` : ""}`);
  }

  // Socials
  await sql`INSERT INTO social_connections (user_id, platform, handle, url, follower_count) VALUES
    (${userId}, 'instagram', 'arb4x4', 'https://www.instagram.com/arb4x4/', 253000),
    (${userId}, 'youtube', 'ARB4x4', 'https://www.youtube.com/@ARB4x4', 108000),
    (${userId}, 'tiktok', 'arb4x4', 'https://www.tiktok.com/@arb4x4', 52000),
    (${userId}, 'twitter', 'ARB4x4', 'https://twitter.com/ARB4x4', 18000)
  `;

  // Services (what Linktree can't do)
  await sql`INSERT INTO services (user_id, title, description, price, delivery_days, category, is_active) VALUES
    (${userId}, 'Sponsored Product Review', 'Professional 4x4 accessory review with installation footage and honest assessment. Published on our channel.', 5000, 14, 'UGC Content', true),
    (${userId}, 'Vehicle Build Feature', 'Full vehicle build feature showcasing your products installed on a customer build. Multi-angle, professional quality.', 15000, 30, 'Video Production', true)
  `;

  console.log("\nDone! View at: hireacreator.ai/u/arb4x4");
  console.log("Dark theme, cover photo, avatar, 17 links, 4 socials, 2 services");
  process.exit(0);
}

run().catch(console.error);
