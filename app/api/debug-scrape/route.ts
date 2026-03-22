import { NextResponse } from "next/server";

/** Fetch via ScrapingBee */
async function fetchViaProxy(url: string): Promise<string | null> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: "false",
    premium_proxy: "true",
  });
  const res = await fetch(`https://app.scrapingbee.com/api/v1/?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  return await res.text();
}

function parseCount(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/,/g, "").trim();
  const match = cleaned.match(/^([\d.]+)([KMB])?$/i);
  if (!match) return parseInt(cleaned, 10) || 0;
  const num = parseFloat(match[1]);
  const mult: Record<string, number> = { K: 1000, M: 1000000, B: 1000000000 };
  return Math.round(num * (match[2] ? mult[match[2].toUpperCase()] || 1 : 1));
}

function parseIG(html: string, handle: string) {
  const ogMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);

  let followers = 0, following = 0, posts = 0;
  if (ogMatch) {
    const desc = ogMatch[1];
    const f = desc.match(/([\d,.]+[KMB]?)\s*Followers/i);
    const fl = desc.match(/([\d,.]+[KMB]?)\s*Following/i);
    const p = desc.match(/([\d,.]+[KMB]?)\s*Posts/i);
    if (f) followers = parseCount(f[1]);
    if (fl) following = parseCount(fl[1]);
    if (p) posts = parseCount(p[1]);
  }

  let name = handle;
  if (titleMatch) {
    const n = titleMatch[1].replace(/\s*\(@[^)]+\).*$/, "").replace(/&#064;/g, "@").trim();
    if (n) name = n;
  }
  if (name === handle && ogMatch) {
    const fromMatch = ogMatch[1].match(/from\s+(.+?)\s*\(&#064;/);
    if (fromMatch) name = fromMatch[1].trim();
  }

  let avatar: string | null = null;
  if (imgMatch) avatar = imgMatch[1].replace(/&amp;/g, "&");

  let bio: string | null = null;
  const bioMatch = html.match(/"biography"\s*:\s*"([^"]+)"/);
  if (bioMatch) bio = bioMatch[1].replace(/\\n/g, "\n");
  if (!bio && ogMatch) {
    const parts = ogMatch[1].split(" - ");
    if (parts.length > 1) bio = parts.slice(1).join(" - ").trim();
  }

  return { name, followers, following, posts, avatar, bio };
}

function parseX(html: string, handle: string) {
  const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
  const ogDesc = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  const ogImg = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);

  let followers = 0;
  const patterns = [/"followers_count"\s*:\s*(\d+)/, /"followersCount"\s*:\s*(\d+)/, /([\d,.]+[KMB]?)\s*Followers/i];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) { followers = parseCount(m[1]); break; }
  }

  let name = handle;
  if (ogTitle) {
    const n = ogTitle[1].replace(/\s*\(@[^)]+\).*$/, "").replace(/ on X$/, "").replace(/ \/ X$/, "").trim();
    if (n) name = n;
  }

  let avatar: string | null = null;
  if (ogImg) avatar = ogImg[1].replace(/&amp;/g, "&");

  let bio: string | null = null;
  if (ogDesc) bio = ogDesc[1].replace(/&amp;/g, "&").trim();

  return { name, followers, avatar, bio };
}

export async function GET(request: Request) {
  const accounts = {
    instagram: ["milescass_", "cristiano", "therock", "nike", "selenagomez"],
    x: ["hireacreatorAI", "elonmusk", "MrBeast", "nike"],
  };

  const results: Record<string, unknown> = {};

  // Test Instagram accounts
  for (const handle of accounts.instagram) {
    try {
      const html = await fetchViaProxy(`https://www.instagram.com/${handle}/`);
      if (html) {
        const parsed = parseIG(html, handle);
        results[`ig_${handle}`] = parsed;
      } else {
        results[`ig_${handle}`] = { error: "No HTML returned" };
      }
    } catch (e: any) {
      results[`ig_${handle}`] = { error: e.message };
    }
  }

  // Test X accounts
  for (const handle of accounts.x) {
    try {
      const html = await fetchViaProxy(`https://x.com/${handle}`);
      if (html) {
        const parsed = parseX(html, handle);
        results[`x_${handle}`] = parsed;
      } else {
        results[`x_${handle}`] = { error: "No HTML returned" };
      }
    } catch (e: any) {
      results[`x_${handle}`] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
