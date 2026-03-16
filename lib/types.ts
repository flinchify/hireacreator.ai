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
};

export type PortfolioItem = {
  id: string;
  title: string;
  image: string;
  category: string;
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
  visibleInMarketplace: boolean;
  socials: Social[];
  services: Service[];
  portfolio: PortfolioItem[];
  reviews: Review[];
};
