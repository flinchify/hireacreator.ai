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
  return rows.length > 0 ? rows[0] : null;
}

export default async function LinkInBioEditorPage() {
  const user = await getUser();
  if (!user) redirect("/");

  return <LinkInBioEditorContent user={user} />;
}
