import { neon } from "@neondatabase/serverless";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Create a .env file with your Neon connection string.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Ensuring schema is up to date...");
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS category VARCHAR(100)`;
  // Allow 'agent' role
  await sql`
    DO $$ BEGIN
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('creator', 'brand', 'agent', 'admin'));
    EXCEPTION WHEN OTHERS THEN NULL;
    END $$
  `;

  console.log("Inserting featured creators...");

  // Creator 1: Jake Thornton — Car Creator (looking for part sponsors)
  const [jake] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'jake@example.com',
      'Jake Thornton',
      'jakethorn',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=400&fit=crop',
      'Car Enthusiast & Automotive Content Creator',
      'I build, mod, and review cars on camera. Currently running a widebody S15 Silvia build and a daily R34 sedan. Looking for parts sponsors, workshop partners, and automotive brands that want authentic content from someone who actually turns wrenches. 180K across TikTok and YouTube.',
      'Sydney, AU',
      'creator',
      'Automotive',
      0,
      4.89,
      67,
      42,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name, slug = EXCLUDED.slug, headline = EXCLUDED.headline,
      bio = EXCLUDED.bio, category = EXCLUDED.category, hourly_rate = EXCLUDED.hourly_rate,
      cover_url = EXCLUDED.cover_url, is_featured = true
    RETURNING id
  `;

  // Creator 2: Priya Mehta — AI Teacher / Consultant
  const [priya] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'priya@example.com',
      'Priya Mehta',
      'priyamehta',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop',
      'AI Educator & Prompt Engineering Consultant',
      'I teach businesses how to actually use AI. Ex-Google, now full-time creator and consultant. I break down LLMs, prompt engineering, and AI workflows for non-technical teams. 50K newsletter subscribers. Clients include Canva, Atlassian, and 30+ startups.',
      'Melbourne, AU',
      'creator',
      'Education / Tech',
      300,
      4.96,
      91,
      124,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name, slug = EXCLUDED.slug, headline = EXCLUDED.headline,
      bio = EXCLUDED.bio, category = EXCLUDED.category, hourly_rate = EXCLUDED.hourly_rate,
      cover_url = EXCLUDED.cover_url, is_featured = true
    RETURNING id
  `;

  // Creator 3: Maya Santos — UGC Creator
  const [maya] = await sql`
    INSERT INTO users (email, full_name, slug, avatar_url, cover_url, headline, bio, location, role, category, hourly_rate, rating, review_count, total_projects, is_verified, is_featured)
    VALUES (
      'maya@example.com',
      'Maya Santos',
      'mayasantos',
      'https://randomuser.me/api/portraits/women/45.jpg',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop',
      'UGC Creator for Beauty, Skincare & Wellness Brands',
      'I make the ads that don''t look like ads. Specialising in beauty, skincare, and wellness UGC — unboxings, tutorials, testimonials, and hook variations. 300+ videos delivered for brands like Frank Body, Go-To Skincare, and JSHealth. Fast turnaround, full usage rights included.',
      'Gold Coast, AU',
      'creator',
      'UGC Creator',
      150,
      4.94,
      156,
      312,
      true,
      true
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name, slug = EXCLUDED.slug, headline = EXCLUDED.headline,
      bio = EXCLUDED.bio, category = EXCLUDED.category, hourly_rate = EXCLUDED.hourly_rate,
      cover_url = EXCLUDED.cover_url, is_featured = true
    RETURNING id
  `;

  // Creator 4: James Okoro — Video Editor (keep from original)
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
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name, slug = EXCLUDED.slug, headline = EXCLUDED.headline,
      bio = EXCLUDED.bio, category = EXCLUDED.category, is_featured = true
    RETURNING id
  `;

  console.log("Inserting social connections...");

  await sql`
    DELETE FROM social_connections WHERE user_id IN (${jake.id}, ${priya.id}, ${maya.id}, ${james.id})
  `;

  await sql`
    INSERT INTO social_connections (user_id, platform, handle, follower_count) VALUES
    (${jake.id}, 'tiktok', '@jakethorn', 120000),
    (${jake.id}, 'youtube', '@JakeThornCars', 85000),
    (${jake.id}, 'instagram', '@jakethorn.cars', 45000),
    (${priya.id}, 'linkedin', 'priyamehta', 65000),
    (${priya.id}, 'youtube', '@PriyaTeachesAI', 40000),
    (${priya.id}, 'twitter', '@priya_ai', 28000),
    (${maya.id}, 'tiktok', '@mayacreates', 90000),
    (${maya.id}, 'instagram', '@maya.santos', 35000),
    (${james.id}, 'youtube', '@JamesEdits', 98000),
    (${james.id}, 'instagram', '@james.okoro', 67000)
  `;

  console.log("Inserting services...");

  await sql`
    DELETE FROM services WHERE user_id IN (${jake.id}, ${priya.id}, ${maya.id}, ${james.id})
  `;

  await sql`
    INSERT INTO services (user_id, title, description, price, delivery_days, category) VALUES
    -- Jake: car creator looking for sponsors, not selling traditional services
    (${jake.id}, 'Parts Sponsorship Feature', 'Install your part on my build, full video coverage of the install and review. Honest take, real results. Includes TikTok + YouTube feature.', 0, 14, 'Sponsorship'),
    (${jake.id}, 'Workshop Partnership', 'Film a full session at your workshop. Show your team, your work, and your vibe to my audience. Great for mechanics and performance shops.', 0, 10, 'Sponsorship'),
    (${jake.id}, 'Car Meet / Event Coverage', 'I''ll attend and shoot content at your car event, meet, or track day. Highlights reel + stories.', 500, 5, 'Events'),

    -- Priya: AI teacher selling consultations
    (${priya.id}, '1-on-1 AI Consultation', 'Live call. AI strategy, tool selection, workflow design for your business. Calendar booking with 48hr notice.', 300, 1, 'Consulting'),
    (${priya.id}, 'Team Workshop (Half Day)', '3-hour hands-on workshop for your team. Prompt engineering, AI tools, custom use cases. Up to 20 people.', 4000, 3, 'Consulting'),
    (${priya.id}, 'Full Day Workshop', '6-hour deep dive. Includes pre-workshop audit of your current workflows + custom playbook delivered after.', 7500, 7, 'Consulting'),
    (${priya.id}, 'Sponsored Newsletter Feature', 'Dedicated send to 50K AI-curious professionals. Includes copy review and performance report.', 2000, 7, 'Sponsorship'),

    -- Maya: UGC services
    (${maya.id}, 'Single UGC Video', '15-30s vertical video. 1 hook, 1 CTA. Raw + edited versions. Full usage rights.', 400, 5, 'UGC'),
    (${maya.id}, 'UGC Starter Pack', '3 videos with different hooks and angles. A/B test ready. Full usage rights.', 1200, 7, 'UGC'),
    (${maya.id}, 'UGC Pro Bundle', '8 videos — 4 concepts x 2 hook variations each. Includes shot list review, revision round, and raw footage.', 2800, 14, 'UGC'),
    (${maya.id}, 'Monthly Content Retainer', '10 videos/month + 5 static photo assets. Dedicated Slack channel. Priority turnaround.', 4500, 30, 'UGC'),

    -- James: video editing
    (${james.id}, 'Brand Film Edit', 'Full post-production for brand films up to 3 min. Color grading, sound design, and motion graphics included.', 2500, 7, 'Video'),
    (${james.id}, 'Social Media Edit Package', '5 short-form edits optimized for TikTok, Reels, and Shorts. Captions, transitions, and sound design.', 800, 4, 'Video')
  `;

  console.log("Inserting portfolio items...");

  await sql`
    DELETE FROM portfolio_items WHERE user_id IN (${jake.id}, ${priya.id}, ${maya.id}, ${james.id})
  `;

  await sql`
    INSERT INTO portfolio_items (user_id, title, image_url, category, sort_order) VALUES
    (${jake.id}, 'S15 Silvia Widebody Build', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop', 'Build', 1),
    (${jake.id}, 'Track Day Coverage', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', 'Events', 2),
    (${jake.id}, 'Turbo Install Series', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop', 'Build', 3),
    (${priya.id}, 'AI Workshop at Canva', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop', 'Workshop', 1),
    (${priya.id}, 'Prompt Engineering Guide', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop', 'Content', 2),
    (${maya.id}, 'Go-To Skincare Campaign', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', 'Beauty', 1),
    (${maya.id}, 'JSHealth Vitamins UGC', 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop', 'Wellness', 2),
    (${maya.id}, 'Frank Body Unboxing', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop', 'Beauty', 3),
    (${james.id}, 'Nike Training Film', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop', 'Sports', 1),
    (${james.id}, 'Travel Stories Series', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop', 'Travel', 2)
  `;

  // Unfeature old creators that aren't in the new set
  await sql`
    UPDATE users SET is_featured = false
    WHERE email IN ('sophia@example.com', 'aisha@example.com', 'marcus@example.com')
  `;

  console.log("Seed complete! Inserted 4 featured creators:");
  console.log("  - Jake Thornton (Car creator, seeking sponsors)");
  console.log("  - Priya Mehta (AI teacher, selling consultations)");
  console.log("  - Maya Santos (UGC creator, selling content services)");
  console.log("  - James Okoro (Video editor, selling editing services)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
