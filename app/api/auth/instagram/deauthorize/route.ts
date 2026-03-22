import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * Instagram Data Deletion Callback
 * When a user removes the app from Instagram, Meta sends a POST here.
 * We delete their data and return a confirmation URL.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.user_id;

    if (userId) {
      const sql = getDb();
      
      // Delete social connections linked to this Instagram user
      await sql`
        DELETE FROM social_connections 
        WHERE platform = 'instagram' AND metadata->>'instagram_user_id' = ${String(userId)}
      `.catch(() => {});

      console.log(`[Instagram Deauthorize] Deleted data for Instagram user ${userId}`);
    }

    // Return confirmation URL and code as Meta requires
    const confirmationCode = `del_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    
    return NextResponse.json({
      url: `https://hireacreator.ai/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  } catch (e) {
    console.error("[Instagram Deauthorize] Error:", e);
    return NextResponse.json({
      url: "https://hireacreator.ai/data-deletion",
      confirmation_code: "error",
    });
  }
}
