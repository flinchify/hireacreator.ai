import { getDb } from "./db";

export type AgentAction =
  | "profile_created"
  | "profile_updated"
  | "service_listed"
  | "service_updated"
  | "creator_hired"
  | "creator_browsed"
  | "earning_received"
  | "payout_requested"
  | "quickstart_completed";

/**
 * Log an agent activity event for analytics.
 * Fire-and-forget — never throws.
 */
export function logAgentActivity(
  agentKeyId: string | null,
  agentUserId: string | null,
  action: AgentAction,
  metadata: Record<string, unknown> = {}
): void {
  const sql = getDb();
  sql`
    INSERT INTO agent_activity (agent_key_id, agent_user_id, action, metadata)
    VALUES (${agentKeyId}, ${agentUserId}, ${action}, ${JSON.stringify(metadata)})
  `.catch(() => {});
}
