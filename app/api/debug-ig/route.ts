import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  
  const results: Record<string, unknown> = {
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + "..." : "MISSING",
    accountId: accountId || "MISSING",
  };

  // Test 1: Check own account via Graph API
  if (token) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      results.meEndpoint = { status: res.status, data };
    } catch (e: any) {
      results.meEndpoint = { error: e.message };
    }
  }

  // Test 2: Check Instagram account
  if (token && accountId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${accountId}?fields=id,username,followers_count,name&access_token=${token}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      results.igAccount = { status: res.status, data };
    } catch (e: any) {
      results.igAccount = { error: e.message };
    }
  }

  // Test 3: Business Discovery for milescass_
  if (token && accountId) {
    try {
      const url = `https://graph.facebook.com/v21.0/${accountId}?fields=business_discovery.fields(username,name,followers_count,biography,profile_picture_url){username%3Dmilescass_}&access_token=${token}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      results.businessDiscovery = { status: res.status, url: url.replace(token, "TOKEN"), data };
    } catch (e: any) {
      results.businessDiscovery = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
