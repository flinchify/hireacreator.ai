import type { SocialProfile } from "./social-scraper";

export interface AIProfileDesign {
  template: string;
  bgType: string;
  bgValue: string;
  textColor: string;
  buttonShape: string;
  suggestedHeadline: string;
  suggestedServices: { title: string; description: string; suggestedPrice: number }[];
  font: string;
}

// --- Template Selection ---

const NICHE_TEMPLATES: Record<string, string[]> = {
  "fitness": ["bold"],
  "health": ["bold"],
  "beauty": ["glass", "pastel"],
  "fashion": ["glass", "pastel"],
  "tech": ["terminal", "neon"],
  "gaming": ["terminal", "neon"],
  "photography": ["showcase", "magazine"],
  "music": ["gradient-mesh", "aurora"],
  "entertainment": ["gradient-mesh", "aurora"],
  "business": ["executive"],
  "entrepreneur": ["executive"],
  "ceo": ["executive"],
  "founder": ["executive"],
  "agency": ["executive"],
  "marketing": ["executive"],
  "finance": ["trader"],
  "investing": ["trader"],
  "trading": ["trader"],
  "stocks": ["trader"],
  "crypto": ["trader"],
  "forex": ["trader"],
  "food": ["sunset", "retro"],
  "cooking": ["sunset", "retro"],
  "travel": ["collage", "bento"],
  "adventure": ["collage", "bento"],
  "education": ["educator"],
  "teacher": ["educator"],
  "tutor": ["educator"],
  "mentor": ["educator"],
  "coach": ["educator"],
  "course": ["educator"],
  "developer": ["developer"],
  "coding": ["developer"],
  "software": ["developer"],
  "engineer": ["developer"],
  "github": ["developer"],
  "art": ["magazine", "aurora"],
  "lifestyle": ["glass", "minimal"],
  "automotive": ["bold", "neon"],
};

function selectTemplate(category: string | null): string {
  if (!category) return "minimal";
  const key = category.toLowerCase().split(/[&\s/]+/)[0]?.trim();
  if (!key) return "minimal";
  const options = NICHE_TEMPLATES[key];
  if (!options || options.length === 0) return "minimal";
  // Deterministic pick based on category length
  return options[category.length % options.length];
}

// --- Color Palette ---

const NICHE_GRADIENTS: Record<string, { gradient: string; textColor: string }> = {
  "fitness": { gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)", textColor: "#ffffff" },
  "health": { gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)", textColor: "#ffffff" },
  "beauty": { gradient: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)", textColor: "#ffffff" },
  "fashion": { gradient: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)", textColor: "#ffffff" },
  "tech": { gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", textColor: "#ffffff" },
  "gaming": { gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", textColor: "#ffffff" },
  "photography": { gradient: "linear-gradient(135deg, #404040 0%, #171717 100%)", textColor: "#ffffff" },
  "music": { gradient: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)", textColor: "#ffffff" },
  "entertainment": { gradient: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)", textColor: "#ffffff" },
  "business": { gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", textColor: "#ffffff" },
  "finance": { gradient: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", textColor: "#ffffff" },
  "food": { gradient: "linear-gradient(135deg, #facc15 0%, #f97316 100%)", textColor: "#171717" },
  "cooking": { gradient: "linear-gradient(135deg, #facc15 0%, #f97316 100%)", textColor: "#171717" },
  "travel": { gradient: "linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)", textColor: "#ffffff" },
  "adventure": { gradient: "linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)", textColor: "#ffffff" },
  "education": { gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", textColor: "#ffffff" },
  "art": { gradient: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)", textColor: "#ffffff" },
  "lifestyle": { gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", textColor: "#ffffff" },
  "automotive": { gradient: "linear-gradient(135deg, #171717 0%, #dc2626 100%)", textColor: "#ffffff" },
};

const DEFAULT_GRADIENT = { gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", textColor: "#ffffff" };

function extractColorPalette(category: string | null): { bgType: string; bgValue: string; textColor: string } {
  if (!category) return { bgType: "gradient", bgValue: DEFAULT_GRADIENT.gradient, textColor: DEFAULT_GRADIENT.textColor };
  const key = category.toLowerCase().split(/[&\s/]+/)[0]?.trim();
  const palette = key ? NICHE_GRADIENTS[key] : undefined;
  if (!palette) return { bgType: "gradient", bgValue: DEFAULT_GRADIENT.gradient, textColor: DEFAULT_GRADIENT.textColor };
  return { bgType: "gradient", bgValue: palette.gradient, textColor: palette.textColor };
}

// --- Service Detection ---

interface SuggestedService {
  title: string;
  description: string;
  suggestedPrice: number; // in cents
}

const SERVICE_PATTERNS: { keywords: RegExp; service: SuggestedService }[] = [
  {
    keywords: /\b(fitness\s*coach|personal\s*train|pt\b|1[:\s]*on[:\s]*1\s*train)/i,
    service: { title: "Personal Training Session", description: "1-on-1 virtual training session", suggestedPrice: 10000 },
  },
  {
    keywords: /\b(online\s*course|course|class|masterclass|workshop)/i,
    service: { title: "Online Course", description: "Self-paced digital course", suggestedPrice: 4900 },
  },
  {
    keywords: /\b(shop|store|merch|merchandise)/i,
    service: { title: "Merch & Products", description: "Official merchandise and products", suggestedPrice: 3500 },
  },
  {
    keywords: /\b(podcast|pod\b)/i,
    service: { title: "Podcast Feature", description: "Guest appearance on podcast", suggestedPrice: 15000 },
  },
  {
    keywords: /\b(youtube|youtuber|yt\b|vlog)/i,
    service: { title: "YouTube Collaboration", description: "Sponsored video or collab", suggestedPrice: 25000 },
  },
  {
    keywords: /\b(book|ebook|e-book|author)/i,
    service: { title: "Digital Book / Guide", description: "Downloadable ebook or guide", suggestedPrice: 1999 },
  },
  {
    keywords: /\b(consult|mentor|coaching|advise|advisor)/i,
    service: { title: "Consultation Call", description: "30-minute strategy consultation", suggestedPrice: 7500 },
  },
  {
    keywords: /\b(photo|photographer|photoshoot|shoot)/i,
    service: { title: "Photography Session", description: "Professional photo session", suggestedPrice: 20000 },
  },
  {
    keywords: /\b(design|designer|graphic|logo|brand)/i,
    service: { title: "Design Package", description: "Custom design work", suggestedPrice: 15000 },
  },
  {
    keywords: /\b(music|beat|producer|mix|master)/i,
    service: { title: "Custom Beat / Production", description: "Original music production", suggestedPrice: 20000 },
  },
  {
    keywords: /\b(ugc|user.generated|content\s*creat)/i,
    service: { title: "UGC Package", description: "User-generated content for your brand", suggestedPrice: 15000 },
  },
  {
    keywords: /\b(recipe|meal\s*plan|nutrition)/i,
    service: { title: "Custom Meal Plan", description: "Personalized nutrition & meal plan", suggestedPrice: 5000 },
  },
];

// Niche-based fallback services when bio has no specific keywords
const NICHE_DEFAULT_SERVICES: Record<string, SuggestedService[]> = {
  "fitness": [{ title: "Personal Training Session", description: "1-on-1 virtual training", suggestedPrice: 10000 }],
  "beauty": [{ title: "Beauty Consultation", description: "Personalized skincare & makeup advice", suggestedPrice: 5000 }],
  "fashion": [{ title: "Style Consultation", description: "Wardrobe & style assessment", suggestedPrice: 7500 }],
  "tech": [{ title: "Tech Consultation", description: "1-on-1 technical advice session", suggestedPrice: 10000 }],
  "gaming": [{ title: "Gaming Coaching Session", description: "Improve your gameplay 1-on-1", suggestedPrice: 5000 }],
  "photography": [{ title: "Photography Session", description: "Professional photo session", suggestedPrice: 20000 }],
  "music": [{ title: "Custom Beat / Production", description: "Original music production", suggestedPrice: 20000 }],
  "business": [{ title: "Business Consultation", description: "Strategy & growth call", suggestedPrice: 15000 }],
  "finance": [{ title: "Financial Consultation", description: "Investment & finance advice", suggestedPrice: 15000 }],
  "food": [{ title: "Custom Meal Plan", description: "Personalized nutrition plan", suggestedPrice: 5000 }],
  "travel": [{ title: "Travel Itinerary", description: "Custom trip planning & recommendations", suggestedPrice: 5000 }],
  "education": [{ title: "Tutoring Session", description: "1-on-1 educational session", suggestedPrice: 5000 }],
};

function detectServices(bio: string | null, externalUrl: string | null, websites: string[], category: string | null): SuggestedService[] {
  const services: SuggestedService[] = [];
  const seen = new Set<string>();

  // Combine all text sources for keyword scanning
  const text = [bio, externalUrl, ...websites].filter(Boolean).join(" ");

  if (text) {
    for (const pattern of SERVICE_PATTERNS) {
      if (pattern.keywords.test(text) && !seen.has(pattern.service.title)) {
        services.push(pattern.service);
        seen.add(pattern.service.title);
      }
    }
  }

  // If no services detected from text, use niche defaults
  if (services.length === 0 && category) {
    const key = category.toLowerCase().split(/[&\s/]+/)[0]?.trim();
    const defaults = key ? NICHE_DEFAULT_SERVICES[key] : undefined;
    if (defaults) {
      for (const s of defaults) {
        if (!seen.has(s.title)) {
          services.push(s);
          seen.add(s.title);
        }
      }
    }
  }

  // Always suggest a shoutout/promotion service for creators with followers
  if (!seen.has("Shoutout / Promotion")) {
    services.push({ title: "Shoutout / Promotion", description: "Sponsored post or story mention", suggestedPrice: 5000 });
  }

  return services;
}

// --- Headline Generation ---

function formatFollowerTier(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K+`;
  return `${count}`;
}

function generateHeadline(profile: SocialProfile): string {
  const parts: string[] = [];

  // Category label — use profile category or detect from bio
  const cat = profile.category || detectNicheFromBio(profile.bio, profile.handle);
  if (cat) {
    const label = cat.replace(/\b\w/g, (c) => c.toUpperCase());
    parts.push(`${label} Creator`);
  } else {
    parts.push("Creator");
  }

  // Follower tier
  if (profile.followerCount >= 1_000) {
    parts.push(`${formatFollowerTier(profile.followerCount)} Community`);
  }

  return parts.join(" \u2022 ");
}

// --- Font Selection ---

const NICHE_FONTS: Record<string, string> = {
  "fitness": "outfit",
  "health": "outfit",
  "beauty": "dm-sans",
  "fashion": "dm-sans",
  "tech": "space-grotesk",
  "gaming": "space-grotesk",
  "photography": "sora",
  "music": "manrope",
  "entertainment": "manrope",
  "business": "inter",
  "finance": "inter",
  "food": "poppins",
  "cooking": "poppins",
  "travel": "jakarta",
  "adventure": "jakarta",
  "education": "inter",
  "art": "sora",
  "lifestyle": "jakarta",
  "automotive": "outfit",
};

function selectFont(category: string | null): string {
  if (!category) return "jakarta";
  const key = category.toLowerCase().split(/[&\s/]+/)[0]?.trim();
  return (key ? NICHE_FONTS[key] : undefined) || "jakarta";
}

// --- Button Shape ---

const NICHE_BUTTON_SHAPES: Record<string, string> = {
  "fitness": "soft",
  "beauty": "pill",
  "fashion": "pill",
  "tech": "square",
  "gaming": "square",
  "photography": "soft",
  "music": "blob",
  "business": "soft",
  "finance": "soft",
  "food": "pill",
  "travel": "soft",
  "art": "blob",
  "lifestyle": "pill",
};

function selectButtonShape(category: string | null): string {
  if (!category) return "soft";
  const key = category.toLowerCase().split(/[&\s/]+/)[0]?.trim();
  return (key ? NICHE_BUTTON_SHAPES[key] : undefined) || "soft";
}

// --- Main Entry Point ---

function detectNicheFromBio(bio: string | null, handle: string): string | null {
  const text = [bio || "", handle].join(" ").toLowerCase();
  const nicheKeywords: Record<string, string[]> = {
    "fitness": ["fitness", "gym", "workout", "trainer", "coach", "athlete", "crossfit", "yoga", "health", "nutrition"],
    "beauty": ["beauty", "makeup", "skincare", "cosmetics", "mua", "esthetician", "hair", "nails"],
    "fashion": ["fashion", "style", "model", "designer", "outfit", "streetwear", "clothing"],
    "tech": ["tech", "developer", "coding", "software", "startup", "founder", "saas", "ai", "engineer", "builds"],
    "developer": ["developer", "dev", "coding", "programmer", "software", "engineer", "github", "fullstack", "frontend", "backend", "devops", "open source"],
    "trading": ["trading", "trader", "forex", "stocks", "crypto", "bitcoin", "investing", "investor", "portfolio", "finance", "fintech", "defi", "nft"],
    "coaching": ["coaching", "coach", "mentor", "mentoring", "course", "courses", "tutor", "tutoring", "teaching", "educator", "workshop", "masterclass"],
    "executive": ["ceo", "founder", "cofounder", "executive", "director", "agency", "consultant", "entrepreneur", "business owner"],
    "gaming": ["gaming", "gamer", "streamer", "esports", "twitch"],
    "photography": ["photo", "photographer", "portrait", "landscape", "camera", "visual"],
    "music": ["music", "musician", "singer", "rapper", "dj", "producer", "artist", "beats"],
    "food": ["food", "chef", "cooking", "recipe", "foodie", "baking", "restaurant"],
    "travel": ["travel", "adventure", "explore", "wanderlust", "digital nomad"],
    "business": ["business", "entrepreneur", "ceo", "finance", "investing", "marketing", "agency"],
    "education": ["teacher", "tutor", "education", "professor", "mentor", "learn"],
    "automotive": ["car", "cars", "automotive", "4wd", "jeep", "offroad", "motorsport"],
  };
  let best: string | null = null;
  let bestCount = 0;
  for (const [niche, keywords] of Object.entries(nicheKeywords)) {
    const count = keywords.filter(k => text.includes(k)).length;
    if (count > bestCount) { bestCount = count; best = niche; }
  }
  return best;
}

export function designProfile(profile: SocialProfile): AIProfileDesign {
  // Try profile category first, then detect from bio/handle
  const category = profile.category || detectNicheFromBio(profile.bio, profile.handle);
  const template = selectTemplate(category);
  const { bgType, bgValue, textColor } = extractColorPalette(category);
  const suggestedServices = detectServices(profile.bio, profile.externalUrl, profile.websites, category);
  const suggestedHeadline = generateHeadline(profile);
  const font = selectFont(category);
  const buttonShape = selectButtonShape(category);

  return {
    template,
    bgType,
    bgValue,
    textColor,
    buttonShape,
    suggestedHeadline,
    suggestedServices,
    font,
  };
}
