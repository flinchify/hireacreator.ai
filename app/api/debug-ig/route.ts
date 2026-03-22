import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  
  const fbToken = process.env.FACEBOOK_PAGE_TOKEN;

  const results: Record<string, unknown> = {
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + "..." : "MISSING",
    accountId: accountId || "MISSING",
    hasFbToken: !!fbToken,
    fbTokenPrefix: fbToken ? fbToken.substring(0, 10) + "..." : "MISSING",
    allEnvKeys: Object.keys(process.env).filter(k => k.includes("FACEBOOK") || k.includes("INSTAGRAM") || k.includes("FB") || k.includes("SCRAPING")).sort(),
  };

  // Test 1: Check own account via Instagram Graph API (IGAA tokens use graph.instagram.com)
  if (token) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${token}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      results.meEndpoint = { status: res.status, data };
    } catch (e: any) {
      results.meEndpoint = { error: e.message };
    }
  }

  // Test 2: Check Instagram account directly
  if (token && accountId) {
    try {
      const res = await fetch(
        `https://graph.instagram.com/v21.0/${accountId}?fields=user_id,username,name,followers_count,biography,profile_picture_url&access_token=${token}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      results.igAccount = { status: res.status, data };
    } catch (e: any) {
      results.igAccount = { error: e.message };
    }
  }

  // Test 3: Business Discovery for milescass_ (requires instagram_business_basic approved)
  if (token && accountId) {
    try {
      // Try with IGAA token on instagram graph
      const url1 = `https://graph.instagram.com/v21.0/${accountId}?fields=business_discovery.fields(username,name,followers_count,biography,profile_picture_url){username%3Dmilescass_}&access_token=${token}`;
      const res1 = await fetch(url1, { signal: AbortSignal.timeout(8000) });
      const data1 = await res1.json();
      results.businessDiscovery_ig = { status: res1.status, data: data1 };
    } catch (e: any) {
      results.businessDiscovery_ig = { error: e.message };
    }

    // Also try with Facebook Page token if available
    const fbToken = process.env.FACEBOOK_PAGE_TOKEN;
    if (fbToken) {
      try {
        const url2 = `https://graph.facebook.com/v21.0/${accountId}?fields=business_discovery.fields(username,name,followers_count,biography,profile_picture_url){username%3Dmilescass_}&access_token=${fbToken}`;
        const res2 = await fetch(url2, { signal: AbortSignal.timeout(8000) });
        const data2 = await res2.json();
        results.businessDiscovery_fb = { status: res2.status, data: data2 };
      } catch (e: any) {
        results.businessDiscovery_fb = { error: e.message };
      }
    } else {
      results.businessDiscovery_fb = { note: "No FACEBOOK_PAGE_TOKEN set" };
    }
  }
  
  results.summary = "Business Discovery requires instagram_business_basic permission to be approved by Meta. App Review is pending.";

  return NextResponse.json(results);
}
