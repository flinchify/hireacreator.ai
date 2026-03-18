export const dynamic = "force-dynamic";
export const revalidate = 0;

import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCreatorBySlug } from "@/lib/queries";
import { getDb } from "@/lib/db";
import { LinkInBioContent } from "@/components/link-in-bio-content";
import { OwnerEditBar } from "@/components/owner-edit-bar";

async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get("session_token")?.value;
  if (!token) return null;
  try {
    const sql = getDb();
    const rows = await sql`SELECT user_id FROM auth_sessions WHERE token = ${token} AND expires_at > NOW() LIMIT 1`;
    return rows[0]?.user_id || null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  let creator;
  try { creator = await getCreatorBySlug(params.slug); } catch { return { title: "Creator - HireACreator.ai" }; }
  if (!creator) return { title: "Creator - HireACreator.ai" };
  return {
    title: `${creator.name} - HireACreator.ai`,
    description: creator.headline || creator.bio || `${creator.name} on HireACreator.ai`,
    openGraph: { title: creator.name, description: creator.headline || "", images: creator.avatar ? [creator.avatar] : [] },
  };
}

export default async function LinkInBioPage({ params }: { params: { slug: string } }) {
  let creator;
  try { creator = await getCreatorBySlug(params.slug); } catch { notFound(); }
  if (!creator) notFound();

  const sessionUserId = await getSessionUserId();
  const isOwner = sessionUserId === creator.id;

  return (
    <>
      {isOwner && <OwnerEditBar slug={params.slug} />}
      <LinkInBioContent creator={creator} />
    </>
  );
}
