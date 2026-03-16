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
};

export type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  category?: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  image: string;
  video?: string;
  category: string;
  mediaType: "image" | "video";
};

export type Review = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
};

export type Creator = {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  cover: string | null;
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
  socials: Social[];
  services: Service[];
  portfolio: PortfolioItem[];
  reviews: Review[];
};
