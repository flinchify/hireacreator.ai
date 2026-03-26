/**
 * One-time migration: Remove mock/test data from the database.
 * Safe to run multiple times.
 *
 * Usage: npx tsx db/remove-mock-data.ts
 * Or inline: node -e "..." with DATABASE_URL set
 */

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function deleteUserAndRelatedData(userId: string, label: string) {
  // Delete from all related tables (order matters for foreign keys)
  const tables = [
    // Analytics
    { table: "profile_views", column: "creator_id" },
    { table: "link_clicks", column: "creator_id" },
    { table: "enquiry_log", column: "creator_id" },
    // Animations, links, verification
    { table: "profile_animations", column: "user_id" },
    { table: "bio_links", column: "user_id" },
    { table: "verification_codes", column: "user_id" },
    // Featured rotations
    { table: "featured_rotations", column: "creator_id" },
    // Agent activity (nullable FK)
    { table: "agent_activity", column: "agent_user_id", isNullable: true },
    // Messaging
    { table: "message_reports", column: "reporter_id" },
    { table: "messages", column: "sender_id" },
    { table: "conversations", column: "participant_a" },
    { table: "conversations", column: "participant_b" },
    // Calendar
    { table: "calendar_bookings", column: "creator_id" },
    { table: "calendar_bookings", column: "client_id", isNullable: true },
    { table: "calendar_sessions", column: "user_id" },
    { table: "availability_slots", column: "user_id" },
    // Agent verifications
    { table: "agent_verifications", column: "user_id" },
    // API keys + rate limits
    { table: "rate_limit_log", column: "api_key_id", subquery: true },
    { table: "api_keys", column: "user_id" },
    // Offers
    { table: "offers", column: "brand_user_id" },
    { table: "offers", column: "creator_user_id" },
    // Reviews, bookings
    { table: "reviews", column: "reviewer_id" },
    { table: "reviews", column: "creator_id" },
    { table: "bookings", column: "client_id" },
    { table: "bookings", column: "creator_id" },
    // Portfolio, services, socials, sessions
    { table: "portfolio_items", column: "user_id" },
    { table: "services", column: "user_id" },
    { table: "social_connections", column: "user_id" },
    { table: "auth_sessions", column: "user_id" },
    // Outreach, stars
    { table: "outreach_contacts", column: "user_id" },
    { table: "stars", column: "user_id" },
  ];

  let totalDeleted = 0;

  for (const t of tables) {
    try {
      if (t.subquery) {
        // rate_limit_log references api_keys, not users directly
        const result = await sql`
          DELETE FROM rate_limit_log
          WHERE api_key_id IN (SELECT id FROM api_keys WHERE user_id = ${userId})
        `;
        const count = (result as any).length ?? 0;
        if (count > 0) {
          console.log(`  - ${t.table}: ${count} rows`);
          totalDeleted += count;
        }
      } else if (t.isNullable) {
        // For nullable FKs, set to null instead of deleting
        await sql`
          UPDATE ${sql(t.table)} SET ${sql(t.column)} = NULL WHERE ${sql(t.column)} = ${userId}
        `;
      } else {
        const result = await sql`
          DELETE FROM ${sql(t.table)} WHERE ${sql(t.column)} = ${userId}
        `;
        const count = (result as any).length ?? 0;
        if (count > 0) {
          console.log(`  - ${t.table} (${t.column}): ${count} rows`);
          totalDeleted += count;
        }
      }
    } catch {
      // Table may not exist yet, skip silently
    }
  }

  // Delete the user row
  try {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    console.log(`  - users: 1 row`);
    totalDeleted += 1;
  } catch (err) {
    console.error(`  Failed to delete user row: ${err}`);
  }

  console.log(`Deleted ${label} (${userId}): ${totalDeleted} total rows removed`);
}

export async function runCleanup() {
  console.log("Starting mock data cleanup...\n");

  // Find demo agent accounts
  const agentAccounts = await sql`
    SELECT id, email, full_name FROM users
    WHERE email LIKE '%@demo-agent.hireacreator.ai'
  `;
  console.log(`Found ${agentAccounts.length} demo agent accounts`);

  // Find ARB demo account
  const arbAccount = await sql`
    SELECT id, email, full_name FROM users
    WHERE email = 'demo@arb.com.au'
  `;
  console.log(`Found ${arbAccount.length} ARB demo account(s)`);

  // Find buildingmeth22 account
  const gibberishAccount = await sql`
    SELECT id, email, full_name FROM users
    WHERE slug = 'buildingmeth22'
  `;
  console.log(`Found ${gibberishAccount.length} buildingmeth22 account(s)\n`);

  const allAccounts = [
    ...agentAccounts.map((a: any) => ({ ...a, label: `agent: ${a.email}` })),
    ...arbAccount.map((a: any) => ({ ...a, label: `arb: ${a.email}` })),
    ...gibberishAccount.map((a: any) => ({ ...a, label: `gibberish: ${a.full_name || a.email}` })),
  ];

  if (allAccounts.length === 0) {
    console.log("No mock data found. Database is clean.");
    return { deleted: 0, accounts: [] };
  }

  for (const account of allAccounts) {
    await deleteUserAndRelatedData(account.id, account.label);
    console.log("");
  }

  console.log(`\nCleanup complete. Removed ${allAccounts.length} mock account(s).`);
  return { deleted: allAccounts.length, accounts: allAccounts.map((a: any) => a.label) };
}

// Run directly if executed as a script
if (require.main === module || process.argv[1]?.includes("remove-mock-data")) {
  runCleanup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Cleanup failed:", err);
      process.exit(1);
    });
}
