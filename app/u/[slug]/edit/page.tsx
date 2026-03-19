export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { WysiwygEditor } from "@/components/wysiwyg-editor";

async function getEditData(slug: string) {
  try {
    const token = cookies().get("session_token")?.value;
    if (!token) return null;

    const sql = getDb();
    const rows = await sql`
      SELECT u.* FROM users u
      JOIN auth_sessions s ON s.user_id = u.id
      WHERE s.token = ${token} AND s.expires_at > NOW() AND u.slug = ${slug}
    `;
    if (rows.length === 0) return null;

    const user = rows[0];
    const [socials, services, bioLinks] = await Promise.all([
      sql`SELECT * FROM social_connections WHERE user_id = ${user.id} ORDER BY created_at`,
      sql`SELECT * FROM services WHERE user_id = ${user.id} ORDER BY created_at`,
      sql`SELECT * FROM bio_links WHERE user_id = ${user.id} AND (is_archived = FALSE OR is_archived IS NULL) ORDER BY position ASC`,
    ]);

    return { user, socials, services, bioLinks };
  } catch (e) {
    console.error('[EditPage] getEditData error:', e);
    return null;
  }
}

export default async function EditPage({ params }: { params: { slug: string } }) {
  const data = await getEditData(params.slug);
  if (!data) redirect("/dashboard");

  return <WysiwygEditor initialData={data} slug={params.slug} />;
}
