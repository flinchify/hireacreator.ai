import { neon } from "@neondatabase/serverless";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Create a .env file with your Neon connection string.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Adding category column to users table if missing...");
  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(100)
  `;

  console.log("Inserting sample creators...");

  // Creator 1: Sophia Chen
  const [sophia] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'sophia@example.com',
      'Sophia Chen',
      'sophia-chen',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
      'UGC Creator & Brand Storyteller',
      'I help DTC brands create authentic, scroll-stopping content that converts. Over 200 campaigns delivered. My content has generated over $2M in attributable revenue for clients.',
      'Los Angeles, CA',
      'creator',
      'UGC Creator',
      150,
      4.97,
      134,
      218,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `;

  // Creator 2: James Okoro
  const [james] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'james@example.com',
      'James Okoro',
      'james-okoro',
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&h=400&fit=crop',
      'Cinematic Video Editor & Motion Designer',
      'Award-winning editor specializing in brand films, product launches, and social content. Former post-production lead at a top agency. Cinematic quality on every project.',
      'New York, NY',
      'creator',
      'Video Editor',
      200,
      4.93,
      89,
      156,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `;

  // Creator 3: Aisha Patel
  const [aisha] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'aisha@example.com',
      'Aisha Patel',
      'aisha-patel',
      'https://randomuser.me/api/portraits/women/65.jpg',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop',
      'Brand Strategist & Social Media Consultant',
      'I help startups and scale-ups build brands people remember. 8 years across beauty, tech, and lifestyle. Previously led social strategy at Ogilvy.',
      'London, UK',
      'creator',
      'Brand Strategist',
      175,
      4.91,
      72,
      94,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `;

  // Creator 4: Marcus Rivera
  const [marcus] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'marcus@example.com',
      'Marcus Rivera',
      'marcus-rivera',
      'https://randomuser.me/api/portraits/men/75.jpg',
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop',
      'Commercial Photographer & Visual Director',
      'Product, lifestyle, and editorial photography for e-commerce and social media. Featured in Vogue, GQ, and Hypebeast.',
      'Miami, FL',
      'creator',
      'Photographer',
      250,
      4.95,
      103,
      187,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id
  `;

  console.log("Inserting social connections...");

  await sql`
    DELETE FROM social_connections WHERE user_id IN (${sophia.id}, ${james.id}, ${aisha.id}, ${marcus.id})
  `;

  await sql`
    INSERT INTO social_connections (user_id, platform, handle, follower_count) VALUES
    (${sophia.id}, 'TikTok', '@sophiachen', 284000),
    (${sophia.id}, 'Instagram', '@sophia.creates', 156000),
    (${sophia.id}, 'YouTube', '@SophiaChenUGC', 42000),
    (${james.id}, 'YouTube', '@JamesEdits', 98000),
    (${james.id}, 'Instagram', '@james.okoro', 67000),
    (${aisha.id}, 'LinkedIn', 'aishapatel', 45000),
    (${aisha.id}, 'Twitter', '@aisha_strategy', 22000),
    (${marcus.id}, 'Instagram', '@marcusrivera', 312000)
  `;

  console.log("Inserting services...");

  await sql`
    DELETE FROM services WHERE user_id IN (${sophia.id}, ${james.id}, ${aisha.id}, ${marcus.id})
  `;

  await sql`
    INSERT INTO services (user_id, title, description, price, delivery_days, category) VALUES
    (${sophia.id}, 'UGC Video Package', '3 hook variations, raw + edited footage, usage rights included. Perfect for paid social campaigns.', 1200, 5, 'UGC'),
    (${sophia.id}, 'Product Unboxing Reel', 'Authentic unboxing experience with genuine reactions. Includes b-roll and lifestyle shots.', 450, 3, 'UGC'),
    (${sophia.id}, 'Monthly Content Retainer', '8 videos per month, content calendar planning, performance review, and unlimited revisions.', 3500, 30, 'UGC'),
    (${james.id}, 'Brand Film Edit', 'Full post-production for brand films up to 3 minutes. Color grading, sound design, and motion graphics included.', 2500, 7, 'Video'),
    (${james.id}, 'Social Media Edit Package', '5 short-form edits optimized for TikTok, Reels, and Shorts. Captions, transitions, and sound design.', 800, 4, 'Video'),
    (${aisha.id}, 'Brand Strategy Sprint', '2-week intensive: brand audit, positioning, visual identity direction, messaging framework, and content pillars.', 5000, 14, 'Strategy'),
    (${aisha.id}, 'Social Media Audit', 'Deep-dive analysis of your current social presence with actionable recommendations and a 90-day roadmap.', 1500, 5, 'Strategy'),
    (${marcus.id}, 'Product Photography Session', 'Half-day studio shoot, 20 final retouched images, white background + lifestyle setups.', 1800, 5, 'Photography'),
    (${marcus.id}, 'Content Day', 'Full day on-location shoot. 50+ edited images for social, web, and print. Creative direction included.', 4000, 7, 'Photography')
  `;

  console.log("Inserting portfolio items...");

  await sql`
    DELETE FROM portfolio_items WHERE user_id IN (${sophia.id}, ${james.id}, ${aisha.id}, ${marcus.id})
  `;

  await sql`
    INSERT INTO portfolio_items (user_id, title, image_url, category, sort_order) VALUES
    (${sophia.id}, 'Beauty Campaign', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', 'Beauty', 1),
    (${sophia.id}, 'Sneaker Launch', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 'Fashion', 2),
    (${sophia.id}, 'Wellness Brand', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop', 'Wellness', 3),
    (${james.id}, 'Training Film', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', 'Sports', 1),
    (${james.id}, 'Travel Stories', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop', 'Travel', 2),
    (${aisha.id}, 'Fintech Rebrand', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop', 'Finance', 1),
    (${aisha.id}, 'DTC Beauty Launch', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', 'Beauty', 2),
    (${marcus.id}, 'Sneaker Lookbook', 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop', 'Fashion', 1),
    (${marcus.id}, 'Skincare Editorial', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop', 'Beauty', 2),
    (${marcus.id}, 'Office Spaces', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop', 'Architecture', 3)
  `;

  console.log("Seed complete! Inserted 4 creators with socials, services, and portfolio items.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
