// Realistic placeholder data for development

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

export type Creator = {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  cover: string;
  headline: string;
  bio: string;
  location: string;
  category: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  totalProjects: number;
  isVerified: boolean;
  isFeatured: boolean;
  socials: { platform: string; handle: string; followers: string }[];
  services: {
    id: string;
    title: string;
    description: string;
    price: number;
    deliveryDays: number;
  }[];
  portfolio: {
    id: string;
    title: string;
    image: string;
    category: string;
  }[];
  reviews: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
};

export const CREATORS: Creator[] = [
  {
    id: "1",
    name: "Sophia Chen",
    slug: "sophia-chen",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop",
    headline: "UGC Creator & Brand Storyteller",
    bio: "I help DTC brands create authentic, scroll-stopping content that converts. Over 200 campaigns delivered for brands like Glossier, Allbirds, and Athletic Greens. My content has generated over $2M in attributable revenue for my clients.",
    location: "Los Angeles, CA",
    category: "UGC Creator",
    hourlyRate: 150,
    rating: 4.97,
    reviewCount: 134,
    totalProjects: 218,
    isVerified: true,
    isFeatured: true,
    socials: [
      { platform: "TikTok", handle: "@sophiachen", followers: "284K" },
      { platform: "Instagram", handle: "@sophia.creates", followers: "156K" },
      { platform: "YouTube", handle: "@SophiaChenUGC", followers: "42K" },
    ],
    services: [
      {
        id: "s1",
        title: "UGC Video Package",
        description: "3 hook variations, raw + edited footage, usage rights included. Perfect for paid social campaigns.",
        price: 1200,
        deliveryDays: 5,
      },
      {
        id: "s2",
        title: "Product Unboxing Reel",
        description: "Authentic unboxing experience with genuine reactions. Includes b-roll and lifestyle shots.",
        price: 450,
        deliveryDays: 3,
      },
      {
        id: "s3",
        title: "Monthly Content Retainer",
        description: "8 videos per month, content calendar planning, performance review, and unlimited revisions.",
        price: 3500,
        deliveryDays: 30,
      },
    ],
    portfolio: [
      { id: "p1", title: "Glossier Campaign", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop", category: "Beauty" },
      { id: "p2", title: "Allbirds Launch", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Fashion" },
      { id: "p3", title: "AG1 Partnership", image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop", category: "Wellness" },
      { id: "p4", title: "Notion Brand Film", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop", category: "Tech" },
    ],
    reviews: [
      { id: "r1", name: "Marcus Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5, comment: "Sophia delivered exactly what we needed for our holiday campaign. The content performed 3x better than our internal creative team's assets. Already booked her for Q1.", date: "2024-12-15" },
      { id: "r2", name: "Elena Rodriguez", avatar: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5, comment: "Incredibly professional and easy to work with. She understood our brand voice from the brief alone. The turnaround time was faster than expected.", date: "2024-11-28" },
    ],
  },
  {
    id: "2",
    name: "James Okoro",
    slug: "james-okoro",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    cover: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&h=400&fit=crop",
    headline: "Cinematic Video Editor & Motion Designer",
    bio: "Award-winning editor specializing in brand films, product launches, and social content. Former post-production lead at a top agency. I bring cinematic quality to every project regardless of budget.",
    location: "New York, NY",
    category: "Video Editor",
    hourlyRate: 200,
    rating: 4.93,
    reviewCount: 89,
    totalProjects: 156,
    isVerified: true,
    isFeatured: true,
    socials: [
      { platform: "YouTube", handle: "@JamesEdits", followers: "98K" },
      { platform: "Instagram", handle: "@james.okoro", followers: "67K" },
    ],
    services: [
      {
        id: "s4",
        title: "Brand Film Edit",
        description: "Full post-production for brand films up to 3 minutes. Color grading, sound design, and motion graphics included.",
        price: 2500,
        deliveryDays: 7,
      },
      {
        id: "s5",
        title: "Social Media Edit Package",
        description: "5 short-form edits optimized for TikTok, Reels, and Shorts. Captions, transitions, and sound design.",
        price: 800,
        deliveryDays: 4,
      },
    ],
    portfolio: [
      { id: "p5", title: "Nike Training Film", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop", category: "Sports" },
      { id: "p6", title: "Airbnb Stories", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop", category: "Travel" },
      { id: "p7", title: "Spotify Wrapped", image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop", category: "Music" },
    ],
    reviews: [
      { id: "r3", name: "Sarah Kim", avatar: "https://randomuser.me/api/portraits/women/45.jpg", rating: 5, comment: "James turned our raw footage into something truly special. His eye for pacing and color is unmatched. He's now our go-to editor for all campaigns.", date: "2024-12-01" },
    ],
  },
  {
    id: "3",
    name: "Aisha Patel",
    slug: "aisha-patel",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop",
    headline: "Brand Strategist & Social Media Consultant",
    bio: "I help startups and scale-ups build brands people remember. 8 years of experience across beauty, tech, and lifestyle. Previously led social strategy at Ogilvy.",
    location: "London, UK",
    category: "Brand Strategist",
    hourlyRate: 175,
    rating: 4.91,
    reviewCount: 72,
    totalProjects: 94,
    isVerified: true,
    isFeatured: true,
    socials: [
      { platform: "LinkedIn", handle: "aishapatel", followers: "45K" },
      { platform: "Twitter", handle: "@aisha_strategy", followers: "22K" },
    ],
    services: [
      {
        id: "s6",
        title: "Brand Strategy Sprint",
        description: "2-week intensive: brand audit, positioning, visual identity direction, messaging framework, and content pillars.",
        price: 5000,
        deliveryDays: 14,
      },
      {
        id: "s7",
        title: "Social Media Audit",
        description: "Deep-dive analysis of your current social presence with actionable recommendations and a 90-day roadmap.",
        price: 1500,
        deliveryDays: 5,
      },
    ],
    portfolio: [
      { id: "p8", title: "Fintech Rebrand", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop", category: "Finance" },
      { id: "p9", title: "DTC Beauty Launch", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop", category: "Beauty" },
    ],
    reviews: [
      { id: "r4", name: "Tom Nguyen", avatar: "https://randomuser.me/api/portraits/men/52.jpg", rating: 5, comment: "Aisha transformed how we think about our brand. Her strategy work gave us a clear direction that our entire team rallied behind. Revenue up 40% since implementation.", date: "2024-11-15" },
    ],
  },
  {
    id: "4",
    name: "Marcus Rivera",
    slug: "marcus-rivera",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=400&fit=crop",
    headline: "Commercial Photographer & Visual Director",
    bio: "Specializing in product, lifestyle, and editorial photography for e-commerce and social media. My images have been featured in Vogue, GQ, and Hypebeast.",
    location: "Miami, FL",
    category: "Photographer",
    hourlyRate: 250,
    rating: 4.95,
    reviewCount: 103,
    totalProjects: 187,
    isVerified: true,
    isFeatured: true,
    socials: [
      { platform: "Instagram", handle: "@marcusrivera", followers: "312K" },
    ],
    services: [
      {
        id: "s8",
        title: "Product Photography Session",
        description: "Half-day studio shoot, 20 final retouched images, white background + lifestyle setups.",
        price: 1800,
        deliveryDays: 5,
      },
      {
        id: "s9",
        title: "Content Day",
        description: "Full day on-location shoot. 50+ edited images for social, web, and print. Creative direction included.",
        price: 4000,
        deliveryDays: 7,
      },
    ],
    portfolio: [
      { id: "p10", title: "Nike Lookbook", image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop", category: "Fashion" },
      { id: "p11", title: "Aesop Editorial", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop", category: "Beauty" },
      { id: "p12", title: "WeWork Spaces", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop", category: "Architecture" },
    ],
    reviews: [
      { id: "r5", name: "Lisa Chang", avatar: "https://randomuser.me/api/portraits/women/33.jpg", rating: 5, comment: "Marcus has an incredible eye. The product shots he delivered tripled our conversion rate on our Shopify store. Worth every penny.", date: "2024-12-10" },
    ],
  },
  {
    id: "5",
    name: "Emma Lindqvist",
    slug: "emma-lindqvist",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    cover: "https://images.unsplash.com/photo-1618556450994-a163d8d30864?w=1200&h=400&fit=crop",
    headline: "Conversion Copywriter & Content Strategist",
    bio: "I write words that sell. Specializing in landing pages, email sequences, and ad copy for SaaS and DTC brands. Average 2.3x improvement in conversion rates across 150+ projects.",
    location: "Stockholm, Sweden",
    category: "Copywriter",
    hourlyRate: 125,
    rating: 4.89,
    reviewCount: 156,
    totalProjects: 243,
    isVerified: true,
    isFeatured: false,
    socials: [
      { platform: "Twitter", handle: "@emmalindqvist", followers: "18K" },
      { platform: "LinkedIn", handle: "emmalindqvist", followers: "31K" },
    ],
    services: [
      {
        id: "s10",
        title: "Landing Page Copy",
        description: "Research-backed landing page copy. Includes headline variations, body copy, CTAs, and social proof sections.",
        price: 1000,
        deliveryDays: 5,
      },
      {
        id: "s11",
        title: "Email Sequence",
        description: "7-email welcome or nurture sequence. Subject lines, preview text, and full body copy with segmentation notes.",
        price: 1400,
        deliveryDays: 7,
      },
    ],
    portfolio: [
      { id: "p13", title: "Linear Launch Page", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop", category: "SaaS" },
      { id: "p14", title: "Warby Parker Emails", image: "https://images.unsplash.com/photo-1563986768609-322da13575f2?w=400&h=400&fit=crop", category: "E-commerce" },
    ],
    reviews: [],
  },
  {
    id: "6",
    name: "Daniel Kim",
    slug: "daniel-kim",
    avatar: "https://randomuser.me/api/portraits/men/85.jpg",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop",
    headline: "Motion Designer & 3D Artist",
    bio: "Creating eye-catching motion graphics and 3D renders for brands and agencies. Clients include Apple, Spotify, and Discord. Every frame is a chance to make someone stop scrolling.",
    location: "San Francisco, CA",
    category: "Motion Designer",
    hourlyRate: 225,
    rating: 4.96,
    reviewCount: 67,
    totalProjects: 112,
    isVerified: true,
    isFeatured: false,
    socials: [
      { platform: "Dribbble", handle: "danielkim", followers: "52K" },
      { platform: "Instagram", handle: "@dkim.motion", followers: "89K" },
    ],
    services: [
      {
        id: "s12",
        title: "Animated Logo",
        description: "Custom logo animation for intros, social media, and presentations. 3 variations with sound design.",
        price: 900,
        deliveryDays: 5,
      },
      {
        id: "s13",
        title: "Product 3D Render",
        description: "Photorealistic 3D product render with custom environment, lighting, and 360-degree rotation video.",
        price: 2000,
        deliveryDays: 7,
      },
    ],
    portfolio: [
      { id: "p15", title: "Discord Animations", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop", category: "Tech" },
      { id: "p16", title: "Spotify Visuals", image: "https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=400&fit=crop", category: "Music" },
    ],
    reviews: [],
  },
];

export function getCreatorBySlug(slug: string): Creator | undefined {
  return CREATORS.find((c) => c.slug === slug);
}

export function getFeaturedCreators(): Creator[] {
  return CREATORS.filter((c) => c.isFeatured);
}
