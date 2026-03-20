import { NextResponse } from "next/server";

function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  return null;
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    const html = await res.text();
    const head = html.substring(0, Math.min(html.indexOf("</head>") + 7 || 50000, 50000));
    const ogMatch = head.match(/property=["']og:image["']\s*content=["']([^"']+)["']/i)
      || head.match(/content=["']([^"']+)["']\s*property=["']og:image["']/i);
    return ogMatch ? ogMatch[1] : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    let linktreeUrl = url.trim();
    if (!linktreeUrl.startsWith("http")) linktreeUrl = "https://" + linktreeUrl;

    // Validate it looks like a Linktree URL
    const parsed = new URL(linktreeUrl);
    if (!parsed.hostname.includes("linktr.ee") && !parsed.hostname.includes("linktree")) {
      return NextResponse.json({ error: "Please provide a linktr.ee URL" }, { status: 400 });
    }

    // Fetch the Linktree page
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 15000);
    const res = await fetch(linktreeUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Could not fetch Linktree page. Check the URL." }, { status: 400 });
    }

    const html = await res.text();

    // Extract profile info
    const profileName = html.match(/data-testid="ProfileHeaderDisplayName"[^>]*>([^<]+)</)?.[1]
      || html.match(/<h1[^>]*>([^<]+)</)?.[1]
      || html.match(/"displayName"\s*:\s*"([^"]+)"/)?.[1]
      || "";
    const profileBio = html.match(/data-testid="ProfileHeaderBio"[^>]*>([^<]+)</)?.[1]
      || html.match(/"description"\s*:\s*"([^"]+)"/)?.[1]
      || "";
    const profileAvatar = html.match(/data-testid="ProfileImage"[^>]*src="([^"]+)"/)?.[1]
      || html.match(/"profilePictureUrl"\s*:\s*"([^"]+)"/)?.[1]
      || html.match(/class="[^"]*profile[^"]*"[^>]*src="([^"]+)"/i)?.[1]
      || "";

    // Try to extract from __NEXT_DATA__ JSON (Linktree uses Next.js)
    const nextDataMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    let linksFromJson: { title: string; url: string; section: string | null }[] = [];
    let jsonProfile = { name: profileName, bio: profileBio, avatar: profileAvatar };

    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const account = nextData?.props?.pageProps?.account;
        if (account) {
          jsonProfile.name = account.profileTitle || account.username || jsonProfile.name;
          jsonProfile.bio = account.description || jsonProfile.bio;
          jsonProfile.avatar = account.profilePictureUrl || jsonProfile.avatar;
        }

        const linksData = nextData?.props?.pageProps?.links || nextData?.props?.pageProps?.account?.links || [];
        let currentSection: string | null = null;

        for (const link of linksData) {
          // Section headers in Linktree are stored as "HEADER" type
          if (link.type === "HEADER" || link.type === "header") {
            currentSection = link.title || null;
            continue;
          }
          if (link.url && link.title) {
            linksFromJson.push({
              title: link.title,
              url: link.url,
              section: currentSection,
            });
          }
        }
      } catch {
        // JSON parse failed, fall through to HTML parsing
      }
    }

    // Fallback: parse links from HTML if JSON extraction didn't work
    if (linksFromJson.length === 0) {
      const linkRegex = /<a[^>]*data-testid="LinkButton"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        linksFromJson.push({ title: match[2].trim(), url: match[1], section: null });
      }

      // Another pattern: regular anchor tags with specific classes
      if (linksFromJson.length === 0) {
        const altRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<p[^>]*data-testid[^>]*>([^<]+)<\/p>/gi;
        while ((match = altRegex.exec(html)) !== null) {
          const href = match[1];
          // Skip Linktree's own links
          if (!href.includes("linktr.ee") && !href.includes("linktree.com")) {
            linksFromJson.push({ title: match[2].trim(), url: href, section: null });
          }
        }
      }
    }

    // Resolve Linktree redirect URLs and fetch thumbnails
    const links = await Promise.all(
      linksFromJson.map(async (link) => {
        // YouTube auto-thumbnail
        let thumbnail = getYoutubeThumbnail(link.url);
        if (!thumbnail) {
          thumbnail = await fetchOgImage(link.url);
        }
        return {
          title: link.title,
          url: link.url,
          thumbnail,
          section: link.section,
        };
      })
    );

    return NextResponse.json({
      profile: jsonProfile,
      links,
    });
  } catch (e: any) {
    console.error("[import/linktree] Error:", e);
    return NextResponse.json({ error: "Failed to import. The page may be private or unavailable." }, { status: 500 });
  }
}
