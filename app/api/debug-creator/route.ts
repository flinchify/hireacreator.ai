export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getCreatorBySlug } from "@/lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "milesrunsai";
  
  try {
    const creator = await getCreatorBySlug(slug);
    if (!creator) return NextResponse.json({ error: "not found" });
    
    return NextResponse.json({
      name: creator.name,
      template: creator.linkBioTemplate,
      font: creator.linkBioFont,
      buttonShape: creator.linkBioButtonShape,
      accent: creator.linkBioAccent,
      bgType: creator.linkBioBgType,
      calendarEnabled: creator.calendarEnabled,
      bioLinksCount: creator.bioLinks.length,
      bioLinks: creator.bioLinks,
      socialsCount: creator.socials.length,
      servicesCount: creator.services.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
