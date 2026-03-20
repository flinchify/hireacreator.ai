import { neon } from "@neondatabase/serverless";

async function seedAdminTest() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Creating admin-test account...");

  const [user] = await sql`
    INSERT INTO users (email, full_name, slug, headline, bio, location, role, category, is_verified, is_featured, link_bio_template, link_bio_accent)
    VALUES (
      'admin-test@hireacreator.ai',
      'Admin Test',
      'admin-test',
      'Testing all link-in-bio templates',
      'This is a test account for previewing every link-in-bio template. Each template has a unique visual style.',
      'Internet',
      'admin',
      'Technology',
      true,
      false,
      'minimal',
      '#6366f1'
    )
    ON CONFLICT (email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      slug = EXCLUDED.slug,
      headline = EXCLUDED.headline,
      bio = EXCLUDED.bio,
      role = EXCLUDED.role,
      link_bio_template = EXCLUDED.link_bio_template,
      link_bio_accent = EXCLUDED.link_bio_accent
    RETURNING id
  `;

  const userId = user.id;
  console.log(`User created/updated with id: ${userId}`);

  // Add social connections
  await sql`DELETE FROM social_connections WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO social_connections (user_id, platform, handle, url, followers)
    VALUES
      (${userId}, 'twitter', '@admintest', 'https://x.com/admintest', '10K'),
      (${userId}, 'instagram', '@admintest', 'https://instagram.com/admintest', '25K'),
      (${userId}, 'youtube', 'AdminTest', 'https://youtube.com/@admintest', '5K'),
      (${userId}, 'github', 'admin-test', 'https://github.com/admin-test', '1K')
  `;
  console.log("Socials added.");

  // Add bio links
  await sql`DELETE FROM bio_links WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO bio_links (user_id, title, url, position, is_visible)
    VALUES
      (${userId}, 'My Portfolio', 'https://example.com/portfolio', 0, true),
      (${userId}, 'Latest Blog Post', 'https://example.com/blog', 1, true),
      (${userId}, 'Book a Call', 'https://cal.com/admintest', 2, true)
  `;
  console.log("Bio links added.");

  // Add services
  await sql`DELETE FROM services WHERE user_id = ${userId}`;
  await sql`
    INSERT INTO services (user_id, title, description, price, delivery_days)
    VALUES
      (${userId}, 'UGC Video', 'Short-form video content for your brand', 250, 5),
      (${userId}, 'Brand Consultation', '1-on-1 strategy session', 150, 1)
  `;
  console.log("Services added.");

  console.log("\nDone! Visit /u/admin-test to preview.");
  console.log("\nTo test each template, run:");
  const templates = [
    "minimal", "glass", "bold", "showcase", "neon", "collage", "bento", "split", "founder", "custom",
    "aurora", "brutalist", "sunset", "terminal", "pastel", "magazine", "retro", "midnight", "clay", "gradient-mesh",
  ];
  for (const t of templates) {
    console.log(`  UPDATE users SET link_bio_template = '${t}' WHERE slug = 'admin-test';`);
  }
}

seedAdminTest().catch(console.error);
