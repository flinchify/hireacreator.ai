import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getUser() {
  try {
    const token = cookies().get("session_token")?.value;
    if (!token) return null;
    const sql = getDb();
    const rows = await sql`
      SELECT u.slug FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
    return rows.length > 0 ? rows[0] : null;
  } catch (e) {
    console.error('[LinkInBioEditor] getUser error:', e);
    return null;
  }
}

export default async function LinkInBioEditorPage() {
  const user = await getUser();
  if (!user) redirect("/");
  redirect('/u/' + user.slug + '/edit');
}
