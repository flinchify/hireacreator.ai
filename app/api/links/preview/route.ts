import { NextResponse } from "next/server";

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// Simple regex-based meta tag extractor (no cheerio dependency)
function extractMeta(html: string): { title: string; description: string; image: string; favicon: string } {
  const result = { title: "", description: "", image: "", favicon: "" };

  // Helper: extract content from a meta tag
  function getMetaContent(nameOrProperty: string): string {
    // Match both property="..." content="..." and content="..." property="..." orders
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${nameOrProperty}["']`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m) return m[1];
    }
    return "";
  }

  // OG tags (primary)
  result.image = getMetaContent("og:image");
  result.title = getMetaContent("og:title");
  result.description = getMetaContent("og:description");

  // Twitter card fallbacks
  if (!result.image) result.image = getMetaContent("twitter:image");
  if (!result.title) result.title = getMetaContent("twitter:title");
  if (!result.description) result.description = getMetaContent("twitter:description");

  // Standard meta description fallback
  if (!result.description) result.description = getMetaContent("description");

  // Title tag fallback
  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = titleMatch[1].trim();
  }

  // Favicon: look for link rel="icon" or rel="shortcut icon"
  const faviconPatterns = [
    /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
  ];
  for (const p of faviconPatterns) {
    const m = html.match(p);
    if (m) { result.favicon = m[1]; break; }
  }

  return result;
}

// Make relative URLs absolute
function resolveUrl(base: string, relative: string): string {
  if (!relative) return "";
  if (relative.startsWith("http://") || relative.startsWith("https://")) return relative;
  if (relative.startsWith("//")) return "https:" + relative;
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 });
  }

  // Validate URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    // YouTube shortcut: construct thumbnail directly
    const ytId = getYouTubeVideoId(url);
    if (ytId) {
      // Still fetch the page for title, but build the thumbnail URL directly
      let title = "";
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)" },
          redirect: "follow",
        });
        if (res.ok) {
          const html = await res.text();
          const meta = extractMeta(html);
          title = meta.title;
        }
      } catch {}

      return NextResponse.json({
        title: title || "YouTube Video",
        description: "",
        image: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        favicon: "https://www.youtube.com/favicon.ico",
      });
    }

    // General fetch
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireACreator/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json({ title: "", description: "", image: "", favicon: "" });
    }

    // Only parse HTML content
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json({ title: "", description: "", image: "", favicon: "" });
    }

    // Read limited amount of HTML (first 100KB should contain all meta tags)
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json({ title: "", description: "", image: "", favicon: "" });
    }

    let html = "";
    const decoder = new TextDecoder();
    const maxBytes = 100 * 1024;
    let totalBytes = 0;

    while (totalBytes < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      totalBytes += value.length;
      // Stop early if we've passed </head>
      if (html.includes("</head>")) break;
    }
    reader.cancel();

    const meta = extractMeta(html);
    const origin = parsed.origin;

    return NextResponse.json({
      title: meta.title,
      description: meta.description,
      image: resolveUrl(origin, meta.image),
      favicon: meta.favicon ? resolveUrl(origin, meta.favicon) : `${origin}/favicon.ico`,
    });
  } catch {
    // Timeout or network error — return empty gracefully
    return NextResponse.json({ title: "", description: "", image: "", favicon: "" });
  }
}
