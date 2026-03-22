/**
 * HireACreator.ai Agent API Demo
 * 1. Creates 4 agent users + verified API keys in DB
 * 2. Uses quickstart to set up profiles
 * 3. Fires 500 API calls across all 4 agents
 */

import crypto from "crypto";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_R2dunLUq0yoG@ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";
const BASE_URL = "https://hireacreator.ai";

// ── Neon HTTP query helper ──
async function query(sql, params = []) {
  const res = await fetch(
    `https://ep-proud-cherry-am4nu0k2-pooler.c-5.us-east-1.aws.neon.tech/sql`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": DATABASE_URL,
      },
      body: JSON.stringify({ query: sql, params }),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DB error ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Key helpers (must match lib/api-keys.ts) ──
function generateKey() {
  return "hca_" + crypto.randomBytes(32).toString("hex");
}
function hashKey(key) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
function getPrefix(key) {
  return key.slice(0, 12);
}

// ── Agent personas ──
const AGENTS = [
  {
    name: "TalentScout AI",
    email: "talentscout@demo-agent.hireacreator.ai",
    slug: "talentscout-ai",
    bio: "AI talent discovery agent. Finds the perfect creator for any campaign in seconds.",
    category: "AI Agent",
    services: [
      { title: "Creator Search", description: "Find creators matching your brand criteria", price: 25, currency: "USD", delivery_days: 1 },
      { title: "Campaign Match", description: "AI-powered creator-brand matching", price: 99, currency: "USD", delivery_days: 2 },
    ],
    socials: [{ platform: "twitter", username: "@talentscout_ai", url: "https://x.com/talentscout_ai" }],
  },
  {
    name: "ContentForge",
    email: "contentforge@demo-agent.hireacreator.ai",
    slug: "contentforge",
    bio: "Automated content strategy agent. Analyzes creator portfolios and recommends optimal content partnerships.",
    category: "AI Agent",
    services: [
      { title: "Content Audit", description: "Full portfolio analysis and optimization report", price: 49, currency: "USD", delivery_days: 3 },
      { title: "Strategy Brief", description: "AI-generated campaign strategy for your brand", price: 149, currency: "USD", delivery_days: 5 },
    ],
    socials: [{ platform: "twitter", username: "@contentforge_ai", url: "https://x.com/contentforge_ai" }],
  },
  {
    name: "BookingBot",
    email: "bookingbot@demo-agent.hireacreator.ai",
    slug: "bookingbot",
    bio: "Smart booking automation. Handles scheduling, payments, and follow-ups for creator collaborations.",
    category: "AI Agent",
    services: [
      { title: "Auto-Book Session", description: "Automated creator session booking with calendar sync", price: 15, currency: "USD", delivery_days: 1 },
    ],
    socials: [{ platform: "twitter", username: "@bookingbot_ai", url: "https://x.com/bookingbot_ai" }],
  },
  {
    name: "InfluenceMetrics",
    email: "metrics@demo-agent.hireacreator.ai",
    slug: "influencemetrics",
    bio: "Real-time creator analytics agent. Track engagement, ROI, and campaign performance across platforms.",
    category: "AI Agent",
    services: [
      { title: "Creator Report", description: "Detailed analytics report on any creator", price: 35, currency: "USD", delivery_days: 1 },
      { title: "Campaign ROI", description: "Post-campaign ROI analysis", price: 199, currency: "USD", delivery_days: 7 },
      { title: "Trend Watch", description: "Weekly trending creators in your niche", price: 19, currency: "USD", delivery_days: 1 },
    ],
    socials: [{ platform: "twitter", username: "@influencemetrics", url: "https://x.com/influencemetrics" }],
  },
];

// ── Step 1: Create agent users + keys in DB ──
async function setupAgents() {
  console.log("=== Setting up 4 agent accounts ===\n");
  const agents = [];

  for (const agent of AGENTS) {
    // Check if user already exists
    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [agent.email]
    );

    let userId;
    if (existing.rows?.length > 0) {
      userId = existing.rows[0].id;
      console.log(`  [exists] ${agent.name} (${userId})`);
    } else {
      // Create user
      const insertResult = await query(
        `INSERT INTO users (email, full_name, slug, bio, category, role, visible_in_marketplace, onboarding_complete)
         VALUES ($1, $2, $3, $4, $5, 'agent', TRUE, TRUE)
         RETURNING id`,
        [agent.email, agent.name, agent.slug, agent.bio, agent.category]
      );
      userId = insertResult.rows[0].id;
      console.log(`  [created] ${agent.name} (${userId})`);
    }

    // Add verification so write scope works
    const verExists = await query(
      "SELECT id FROM agent_verifications WHERE user_id = $1 AND status = 'verified'",
      [userId]
    );
    if (!(verExists.rows?.length > 0)) {
      const vToken = crypto.randomBytes(16).toString("hex");
      await query(
        `INSERT INTO agent_verifications (user_id, domain, method, verification_token, status, verified_at)
         VALUES ($1, $2, 'email', $3, 'verified', NOW())`,
        [userId, `${agent.slug}.demo-agent.hireacreator.ai`, vToken]
      );
    }

    // Create API key
    const key = generateKey();
    const hash = hashKey(key);
    const prefix = getPrefix(key);

    // Delete old demo keys for this user
    await query("DELETE FROM api_keys WHERE user_id = $1 AND name = 'Demo Key'", [userId]);

    await query(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash, tier, scopes)
       VALUES ($1, 'Demo Key', $2, $3, 'free', '{read,write,book}')`,
      [userId, prefix, hash]
    );

    agents.push({ ...agent, userId, apiKey: key });
    console.log(`  [key] ${prefix}...`);
  }

  console.log(`\n✓ ${agents.length} agents ready\n`);
  return agents;
}

// ── Step 2: Set up profiles via quickstart ──
async function setupProfiles(agents) {
  console.log("=== Setting up profiles via /api/agent/quickstart ===\n");

  for (const agent of agents) {
    const res = await fetch(`${BASE_URL}/api/agent/quickstart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agent.apiKey}`,
      },
      body: JSON.stringify({
        name: agent.name,
        slug: agent.slug,
        bio: agent.bio,
        category: agent.category,
        services: agent.services,
        socials: agent.socials,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`  ✓ ${agent.name} → ${data.profile?.public_url || "ok"}`);
    } else {
      console.log(`  ✗ ${agent.name}: ${data.error} - ${data.message}`);
    }
  }
  console.log();
}

// ── Step 3: Fire 500 API calls ──
async function runDemo(agents) {
  console.log("=== Running 500 API calls across 4 agents ===\n");

  const endpoints = [
    { path: "/api/agent/creators", scope: "read", method: "GET" },
    { path: "/api/agent/creators?category=AI%20Agent", scope: "read", method: "GET" },
    { path: "/api/agent/creators?search=content", scope: "read", method: "GET" },
    { path: "/api/agent/creators?limit=10", scope: "read", method: "GET" },
    { path: "/api/agent/profile", scope: "read", method: "GET" },
  ];

  let total = 0;
  let success = 0;
  let rateLimited = 0;
  let errors = 0;
  const perAgent = {};

  const TOTAL_CALLS = 500;
  const BATCH_SIZE = 10; // concurrent per batch
  const BATCHES = TOTAL_CALLS / BATCH_SIZE;

  for (const a of agents) perAgent[a.name] = { ok: 0, limited: 0, err: 0 };

  const startTime = Date.now();

  for (let batch = 0; batch < BATCHES; batch++) {
    const promises = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const agent = agents[(batch * BATCH_SIZE + i) % agents.length];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

      promises.push(
        fetch(`${BASE_URL}${endpoint.path}`, {
          method: endpoint.method,
          headers: { Authorization: `Bearer ${agent.apiKey}` },
        }).then(async (res) => {
          total++;
          if (res.ok) {
            success++;
            perAgent[agent.name].ok++;
          } else if (res.status === 429) {
            rateLimited++;
            perAgent[agent.name].limited++;
          } else {
            errors++;
            perAgent[agent.name].err++;
          }
          // consume body
          await res.text();
        }).catch(() => {
          total++;
          errors++;
          perAgent[agent.name].err++;
        })
      );
    }

    await Promise.all(promises);

    // Progress every 50 calls
    if ((batch + 1) % 5 === 0) {
      console.log(`  [${total}/${TOTAL_CALLS}] ✓${success} ⚡${rateLimited} ✗${errors}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n=== Results ===`);
  console.log(`Total: ${total} calls in ${elapsed}s`);
  console.log(`Success: ${success} | Rate Limited: ${rateLimited} | Errors: ${errors}`);
  console.log(`Throughput: ${(total / parseFloat(elapsed)).toFixed(0)} req/s\n`);

  console.log("Per Agent:");
  for (const [name, stats] of Object.entries(perAgent)) {
    console.log(`  ${name}: ✓${stats.ok} ⚡${stats.limited} ✗${stats.err}`);
  }

  return { total, success, rateLimited, errors, elapsed };
}

// ── Main ──
async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  HireACreator.ai — Agent API Demo       ║");
  console.log("║  4 Agents × 500 Token Calls             ║");
  console.log("╚══════════════════════════════════════════╝\n");

  try {
    const agents = await setupAgents();
    await setupProfiles(agents);
    const results = await runDemo(agents);

    console.log("\n✓ Demo complete!");
    console.log(`Agent profiles live at:`);
    for (const a of AGENTS) {
      console.log(`  → ${BASE_URL}/${a.slug}`);
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
