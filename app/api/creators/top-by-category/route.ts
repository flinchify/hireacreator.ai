import { NextResponse } from "next/server";
import { getTopCreatorsByCategory } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTopCreatorsByCategory();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}
