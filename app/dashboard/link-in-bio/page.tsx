import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { LinkInBioEditorContent } from "@/components/link-in-bio-editor";

async function getUser() {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  const sql = getDb();
  const rows = await sql`
    SELECT u.* FROM users u
    JOIN auth_sessions s ON s.user_id = u.id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  if (rows.length === 0) return null;
  const user = rows[0];
  const [socials, services, animations] = await Promise.all([
    sql`SELECT * FROM social_connections WHERE user_id = ${user.id}`,
    sql`SELECT * FROM services WHERE user_id = ${user.id}`,
    sql`SELECT animation_type FROM profile_animations WHERE user_id = ${user.id}`,
  ]);
  return { ...user, socials, services, owned_animations: animations.map((a: any) => a.animation_type) };
}

export default async function LinkInBioEditorPage() {
  const user = await getUser();
  if (!user) redirect("/");

  return <LinkInBioEditorContent user={user} />;
}
