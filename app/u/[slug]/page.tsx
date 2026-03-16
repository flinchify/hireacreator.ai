import { notFound } from "next/navigation";
import { getCreatorBySlug } from "@/lib/queries";
import { LinkInBioContent } from "@/components/link-in-bio-content";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  let creator;
  try {
    creator = await getCreatorBySlug(params.slug);
  } catch {
    return { title: "Creator - HireACreator.ai" };
  }
  if (!creator) return { title: "Creator - HireACreator.ai" };
  return {
    title: `${creator.name} - HireACreator.ai`,
    description: creator.headline || creator.bio || `${creator.name} on HireACreator.ai`,
    openGraph: {
      title: creator.name,
      description: creator.headline || "",
      images: creator.avatar ? [creator.avatar] : [],
    },
  };
}

export default async function LinkInBioPage({ params }: { params: { slug: string } }) {
  let creator;
  try {
    creator = await getCreatorBySlug(params.slug);
  } catch {
    notFound();
  }
  if (!creator) notFound();

  return <LinkInBioContent creator={creator} />;
}
