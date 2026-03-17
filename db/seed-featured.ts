import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const sql = neon("postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require");

const FEATURED_CREATORS = [
  {
    name: "Sophia Chen", email: "sophia.chen@demo.hireacreator.ai", slug: "sophia-chen",
    headline: "UGC Creator / Product Photographer", bio: "Creating scroll-stopping content for DTC brands. Based in Sydney, specializing in beauty, skincare, and lifestyle products. 3+ years experience with brands like Mecca and Go-To Skincare.",
    location: "Sydney, Australia", category: "UGC",
    template: "glass", accent: "#6366f1",
    socials: [{ platform: "instagram", handle: "sophiachen.creates" }, { platform: "tiktok", handle: "sophiachencreates" }],
    services: [{ title: "UGC Video (30s)", price: 250, desc: "One 30-second vertical video with hooks, b-roll, and CTA" }, { title: "Product Photography (10 images)", price: 400, desc: "10 high-quality product photos, styled and edited" }],
  },
  {
    name: "Marcus Rivera", email: "marcus.rivera@demo.hireacreator.ai", slug: "marcus-rivera",
    headline: "Video Editor / Motion Designer", bio: "Cinematic edits for creators and brands. I turn raw footage into stories that convert. Premiere Pro, After Effects, DaVinci Resolve.",
    location: "Melbourne, Australia", category: "Video Editing",
    template: "bold", accent: "#dc2626",
    socials: [{ platform: "youtube", handle: "marcusedits" }, { platform: "instagram", handle: "marcus.edits" }],
    services: [{ title: "YouTube Video Edit", price: 350, desc: "Full edit of 10-15min video with color, sound, and motion graphics" }, { title: "Short-Form Package (5 Reels)", price: 500, desc: "5 edited short-form videos from your raw footage" }],
  },
  {
    name: "Aisha Patel", email: "aisha.patel@demo.hireacreator.ai", slug: "aisha-patel",
    headline: "Social Media Manager / Content Strategist", bio: "I help brands grow on Instagram and TikTok with data-driven content strategies. Former agency strategist, now freelance. I work with food, fashion, and wellness brands.",
    location: "Gold Coast, Australia", category: "Social Media",
    template: "sunset", accent: "#ea580c",
    socials: [{ platform: "instagram", handle: "aisha.strategy" }, { platform: "twitter", handle: "aishapatel" }, { platform: "tiktok", handle: "aishacreates" }],
    services: [{ title: "Content Strategy (Monthly)", price: 800, desc: "Full monthly content calendar, captions, hashtag research, and analytics report" }, { title: "Instagram Audit", price: 150, desc: "Comprehensive audit with actionable recommendations" }],
  },
  {
    name: "Jake Morrison", email: "jake.morrison@demo.hireacreator.ai", slug: "jake-morrison",
    headline: "Podcast Producer / Audio Engineer", bio: "Crystal-clear audio for podcasts and content creators. I handle recording, editing, mixing, mastering, and show notes. 200+ episodes produced.",
    location: "Brisbane, Australia", category: "Audio",
    template: "terminal", accent: "#22c55e",
    socials: [{ platform: "youtube", handle: "jakeaudio" }, { platform: "twitter", handle: "jakepodpro" }],
    services: [{ title: "Podcast Episode Edit", price: 100, desc: "Full edit, noise removal, leveling, intro/outro" }, { title: "Podcast Launch Package", price: 600, desc: "Cover art, intro music, 3 edited episodes, RSS setup" }],
  },
  {
    name: "Lily Nguyen", email: "lily.nguyen@demo.hireacreator.ai", slug: "lily-nguyen",
    headline: "Graphic Designer / Brand Identity", bio: "Minimal, modern brand identities for startups and personal brands. Figma, Illustrator, brand guidelines, social templates. I make you look expensive.",
    location: "Perth, Australia", category: "Design",
    template: "minimal", accent: "#171717",
    socials: [{ platform: "instagram", handle: "lilydesigns.au" }, { platform: "website", handle: "lilydesigns.com.au" }],
    services: [{ title: "Logo Design", price: 500, desc: "3 concepts, unlimited revisions, all file formats" }, { title: "Brand Identity Kit", price: 1200, desc: "Logo, color palette, typography, brand guidelines, social templates" }],
  },
  {
    name: "Tom Gallagher", email: "tom.gallagher@demo.hireacreator.ai", slug: "tom-gallagher",
    headline: "Copywriter / Email Marketing", bio: "Words that sell. I write landing pages, email sequences, and ad copy for SaaS and e-commerce brands. Clients include Canva, Koala, and Culture Kings.",
    location: "Sydney, Australia", category: "Writing",
    template: "magazine", accent: "#171717",
    socials: [{ platform: "twitter", handle: "tomwrites" }, { platform: "website", handle: "tomgallagher.com.au" }],
    services: [{ title: "Landing Page Copy", price: 450, desc: "Full page copy with headline, body, CTA, and meta description" }, { title: "Email Sequence (5 emails)", price: 350, desc: "Welcome, nurture, or sales sequence with subject lines" }],
  },
  {
    name: "Zara Ali", email: "zara.ali@demo.hireacreator.ai", slug: "zara-ali",
    headline: "TikTok Creator / Lifestyle Influencer", bio: "200K+ followers. I create authentic, relatable content for Gen Z brands. Specializing in fashion, beauty, and food. Available for sponsored posts and brand partnerships.",
    location: "Melbourne, Australia", category: "Influencer",
    template: "retro", accent: "#ec4899",
    socials: [{ platform: "tiktok", handle: "zaraali" }, { platform: "instagram", handle: "zara.ali" }, { platform: "youtube", handle: "zaraalivlogs" }],
    services: [{ title: "Sponsored TikTok (1 post)", price: 300, desc: "One branded TikTok video with your product, scripted by me" }, { title: "Brand Partnership (Monthly)", price: 1500, desc: "4 TikToks + 2 Instagram stories + usage rights" }],
  },
  {
    name: "Ryan Cooper", email: "ryan.cooper@demo.hireacreator.ai", slug: "ryan-cooper",
    headline: "Web Developer / No-Code Builder", bio: "I build fast, beautiful websites for creators and small businesses. Next.js, Webflow, Framer. From landing pages to full e-commerce. 48hr turnaround on most projects.",
    location: "Adelaide, Australia", category: "Development",
    template: "midnight", accent: "#d4a574",
    socials: [{ platform: "twitter", handle: "ryanbuilds" }, { platform: "github", handle: "ryancooper-dev" }],
    services: [{ title: "Landing Page", price: 300, desc: "Responsive landing page, mobile-first, deployed" }, { title: "Full Website (5 pages)", price: 1500, desc: "Design + development, CMS, SEO basics, hosting setup" }],
  },
  {
    name: "Emma Walsh", email: "emma.walsh@demo.hireacreator.ai", slug: "emma-walsh",
    headline: "Voiceover Artist / Narrator", bio: "Warm, professional voice for ads, explainers, and audiobooks. Home studio with broadcast-quality gear. Same-day turnaround available. Featured on Channel 9 and Spotify campaigns.",
    location: "Sydney, Australia", category: "Voiceover",
    template: "aurora", accent: "#a78bfa",
    socials: [{ platform: "instagram", handle: "emmawalshmedia" }, { platform: "youtube", handle: "emmavo" }],
    services: [{ title: "30s Commercial VO", price: 150, desc: "30-second voiceover with 2 revisions" }, { title: "Explainer Video VO (2min)", price: 250, desc: "Up to 2-minute narration, synced to your edit" }],
  },
  {
    name: "Kai Tanaka", email: "kai.tanaka@demo.hireacreator.ai", slug: "kai-tanaka",
    headline: "3D Artist / Animation", bio: "I create 3D product renders, animations, and AR assets for brands. Blender, Cinema4D. Worked with Nike AU, Lego, and Red Bull. Photorealistic to stylized.",
    location: "Melbourne, Australia", category: "3D/Animation",
    template: "gradient-mesh", accent: "#6366f1",
    socials: [{ platform: "instagram", handle: "kai3d" }, { platform: "website", handle: "kaitanaka.art" }],
    services: [{ title: "Product Render (3 angles)", price: 400, desc: "Photorealistic 3D render of your product, 3 angles, high-res" }, { title: "15s Product Animation", price: 800, desc: "Animated product reveal or turntable for ads" }],
  },
];

async function seed() {
  for (const c of FEATURED_CREATORS) {
    // Check if already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${c.email}`;
    if (existing.length > 0) {
      console.log(`Skipping ${c.name} (already exists)`);
      continue;
    }

    const refCode = crypto.randomBytes(6).toString("hex");
    const users = await sql`
      INSERT INTO users (email, full_name, slug, role, headline, bio, location, category, 
        email_verified, email_verified_at, onboarding_complete, is_featured,
        link_bio_template, link_bio_accent, referral_code, privacy_allow_messages)
      VALUES (${c.email}, ${c.name}, ${c.slug}, 'creator', ${c.headline}, ${c.bio}, ${c.location}, ${c.category},
        true, NOW(), true, true,
        ${c.template}, ${c.accent}, ${refCode}, true)
      RETURNING id
    `;
    const userId = users[0].id;
    console.log(`Created ${c.name} (${userId})`);

    // Add socials
    for (const s of c.socials) {
      await sql`INSERT INTO social_connections (user_id, platform, handle) VALUES (${userId}, ${s.platform}, ${s.handle})`;
    }
    console.log(`  Added ${c.socials.length} socials`);

    // Add services
    for (const s of c.services) {
      await sql`INSERT INTO services (user_id, title, description, price, is_active) VALUES (${userId}, ${s.title}, ${s.desc}, ${s.price}, true)`;
    }
    console.log(`  Added ${c.services.length} services`);
  }

  console.log("\nDone! Seeded", FEATURED_CREATORS.length, "featured creators");
}

seed().catch(e => console.error("Seed error:", e.message));
