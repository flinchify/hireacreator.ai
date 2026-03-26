export const CATEGORIES = [
  "UGC Creator",
  "Video Editor",
  "Photographer",
  "Graphic Designer",
  "Social Media Manager",
  "Copywriter",
  "Brand Strategist",
  "Motion Designer",
  "Podcast Producer",
  "Influencer",
  "Automotive",
  "Education / Tech",
  "Consultant",
  "Music Producer",
  "Developer",
] as const;

export type Social = {
  platform: string;
  handle: string;
  followers: string;
  url?: string;
  followersRefreshedAt?: string | null;
};

export type ServicePackage = {
  id: string;
  tier: "basic" | "standard" | "premium";
  title: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  thumbnailUrl?: string | null;
  category?: string;
  packages?: ServicePackage[];
};

export type Testimonial = {
  id: string;
  clientName: string;
  clientCompany: string | null;
  clientAvatar: string | null;
  content: string;
  rating: number | null;
  source: string | null;
  screenshotUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
};

export type PortfolioTemplateType = "standard" | "before_after" | "campaign_results" | "process_breakdown" | "client_story";

export type BeforeAfterData = { beforeImage: string; afterImage: string; description: string };
export type CampaignResultsData = { metrics: { label: string; value: string; change?: string }[]; summary: string };
export type ProcessBreakdownData = { steps: { title: string; description: string; image?: string }[] };
export type ClientStoryData = { clientName: string; clientCompany: string; quote: string; results: string };

export type PortfolioItem = {
  id: string;
  title: string;
  image: string;
  video?: string;
  category: string;
  mediaType: "image" | "video";
  templateType: PortfolioTemplateType;
  templateData: BeforeAfterData | CampaignResultsData | ProcessBreakdownData | ClientStoryData | Record<string, never>;
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type Product = {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  productUrl: string | null;
  thumbnailUrl: string | null;
  productType: string;
  isActive: boolean;
  sortOrder: number;
};

export type Creator = {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  cover: string | null;
  logoUrl: string | null;
  headerImageUrl: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  category: string | null;
  hourlyRate: number | null;
  rating: number;
  reviewCount: number;
  totalProjects: number;
  isVerified: boolean;
  isFeatured: boolean;
  isOnline: boolean;
  isPro: boolean;
  subscriptionTier: string;
  visibleInMarketplace: boolean;
  websiteUrl: string | null;
  businessName: string | null;
  businessUrl: string | null;
  allowMessages: boolean;
  is18PlusContent: boolean;
  linkBioTemplate: string;
  linkBioAccent: string;
  linkBioFont: string;
  linkBioTextColor: string;
  linkBioBgType: string;
  linkBioBgValue: string;
  linkBioBgVideo: string;
  linkBioBgImages: string[];
  linkBioButtonShape: string;
  linkBioButtonAnim: string;
  linkBioCardStyle: string;
  linkBioIntroAnim: string;
  linkBioTextSize: string;
  linkBioAvatarSize: string;
  linkBioButtonSize: string;
  linkBioContentPosition: string;
  linkBioContentAlign: string;
  hideBranding: boolean;
  hasStripeAccount: boolean;
  calendarEnabled: boolean;
  profileViews: number;
  nicheRank: number;
  creatorScore: number;
  scoreBreakdown: { profile?: number; reach?: number; engagement?: number; reputation?: number; experience?: number; trust?: number; total?: number };
  bioLinks: { id: string; title: string; url: string; thumbnailUrl: string | null; isVisible: boolean; isPinned: boolean; clickCount: number; sectionName: string | null; displayStyle: string }[];
  socials: Social[];
  services: Service[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  products: Product[];
  testimonials: Testimonial[];
};
