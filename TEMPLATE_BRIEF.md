# Template Rewrite Brief

## File: components/link-in-bio-content.tsx

## Mission
Rewrite ALL 8 template functions to look like premium $50/mo products. Each template must be visually stunning, unique, and production-ready. Think Stan Store, Linktree Pro, Leadrr quality.

## Target Users
- Australian car content creators (drift, 4WD, builds)
- Small businesses (car shops, 4WD workshops, detailers)
- UGC creators, photographers, videographers
- Music producers, DJs

## What to rewrite
ONLY the 8 template functions: TemplateMinimal, TemplateGlass, TemplateBold, TemplateShowcase, TemplateNeon, TemplateCollage, TemplateBento, TemplateSplit

DO NOT touch: imports, FONT_MAP, btnClass, cardCls, BgLayer, BioLinksSection, priceLabel, VerifiedBadge, ProBadge, Avatar, OnlineDot, Socials, SectionLabel, ServiceCard, CTAButton, EmptyState, ShareBtn, Branding, TEMPLATES map, LinkInBioContent export, or TemplateCustom.

## Design Rules

### Every template MUST render these in order:
1. ShareBtn (top right)
2. Avatar (with creator.avatar or fallback showing first letter)
3. Name (creator.name) with VerifiedBadge + ProBadge
4. @username (creator.slug)
5. Headline (creator.headline) — if exists
6. Location (creator.location) — if exists  
7. Online indicator (creator.isOnline) via OnlineDot
8. Socials row via <Socials creator={creator} light={isDark} />
9. Bio text (creator.bio) — if exists
10. Bio links via <BioLinksSection creator={creator} light={isDark} />
11. Services via creator.services.map(s => <ServiceCard key={s.id} service={s} creator={creator} light={isDark} />)
12. Portfolio grid if creator.portfolio.length > 0
13. Calendar: {creator.calendarEnabled && <div className="my-6"><CalendarBooking creatorId={creator.id} creatorName={creator.name} /></div>}
14. Empty state: {isEmpty && <EmptyState light={isDark} />}
15. CTA: {!isEmpty && <CTAButton creator={creator} light={isDark} accent={accent} />}
16. Branding: <Branding light={isDark} />

### Visual Standards
- Tailwind CSS only, no external libs
- hover:scale-[1.02] on all clickable items
- transition-all duration-200 on interactive elements
- Generous padding (px-6 sm:px-8, py-4 sm:py-5)
- Text hierarchy: font-display for names (text-xl sm:text-2xl font-bold), text-sm for body
- Each template must be OBVIOUSLY different at a glance
- No template should look generic or flat
- Must look premium even WITHOUT cover photo or custom background

### Dark template card style:
bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl

### Light template card style:
bg-white border border-neutral-200/60 shadow-sm rounded-2xl

### Available data on creator:
name, slug, avatar, cover, headline, bio, location, category, hourlyRate, rating, reviewCount, totalProjects, isVerified, isFeatured, isOnline, isPro, subscriptionTier, websiteUrl, businessName, allowMessages, linkBioTemplate, linkBioAccent, linkBioBgType, linkBioBgValue, linkBioBgVideo, linkBioBgImages, linkBioButtonShape, linkBioButtonAnim, linkBioCardStyle, linkBioIntroAnim, calendarEnabled, bioLinks[], socials[], services[], portfolio[]

## Template Specifications

### 1. TemplateMinimal — "The Business Card"
- Warm ivory/cream background: linear-gradient(160deg, #fdf8f4, #f5ede6, #ebe3da)
- White card, rounded-[2.5rem], shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)]
- Cover photo: h-48, bottom gradient fades to white, avatar overlaps -14
- Avatar: w-28 h-28 rounded-full, border-4 border-white, shadow-xl
- No cover? Show subtle gradient using accent color at 8% opacity
- Location in a pill badge (bg-neutral-50 border rounded-full)
- Portfolio in 3-col grid with rounded-2xl, hover:scale-105
- Clean, professional, would impress a business owner

### 2. TemplateGlass — "The Creator"  
- Deep space gradient: from-[#0c0118] via-[#150d30] to-[#0a0a1a]
- TWO floating glow orbs: accent color top-left (opacity-25), pink bottom-right (opacity-15)
- Avatar: w-28 h-28 with accent-colored glow ring (blur-2xl behind avatar)
- Stats bar if creator has projects/rating/reviews (frosted glass bg-white/5 rounded-2xl)
- All content sections wrapped in frosted glass panels
- Bio links and services use bg-white/[0.06] backdrop-blur-xl
- Portfolio items have border border-white/[0.06]
- This is the hero template — must look like a premium app

### 3. TemplateBold — "The Statement"
- Pure black #0a0a0a background
- White card with very rounded corners (rounded-[2.5rem]) on dark bg
- OR full dark with accent color highlights
- Avatar: w-24 h-24 rounded-2xl (square with rounded corners), border with accent color
- Name: text-2xl font-black tracking-tight
- Username in accent color
- Accent-colored thin dividers (h-[2px]) between sections
- Services show price in accent color
- High contrast, dramatic, makes a statement

### 4. TemplateShowcase — "The Portfolio"
- Light background: linear-gradient(160deg, #f8f9fa, #e9ecef)
- White card, rounded-[2rem]
- Cover photo prominent: h-52
- Portfolio is THE focus: 2-col grid, aspect-[4/3], rounded-2xl, hover zoom
- Services as horizontal cards with price on right
- Professional but visual-first
- Great for photographers, car photographers, videographers

### 5. TemplateNeon — "The Gamer"
- Pure black background
- Card has accent-colored glow: boxShadow: 0 0 80px -20px ${accent}50
- Avatar with double ring: outer ring in accent color, inner ring dark
- Username in accent color
- Social icons in accent-tinted circles (bg: accent at 10%, border: accent at 20%)
- Services have accent glow on hover
- Scanline overlay effect (optional subtle CSS)
- Cyberpunk, gaming, tech aesthetic

### 6. TemplateCollage — "The Photographer"
- Background: grid of portfolio images (or linkBioBgImages) as tiles, darkened
- If no images: deep navy gradient from-[#1a1a2e] via-[#16213e] to-[#0f3460]
- Content in centered frosted glass panel: bg-black/30 backdrop-blur-2xl rounded-3xl border border-white/10
- Avatar: rounded-2xl (square), with subtle rotation (rotate-2) for style
- All text is white/light
- Services and links in frosted glass
- Moody, artistic, editorial

### 7. TemplateBento — "The Grid"
- Dark background #0a0a0a
- Content in Apple-style bento grid: grid-cols-4, auto-rows-[85px]
- Identity card: col-span-4 row-span-2, rounded-3xl, accent gradient overlay
- Bio: col-span-4, frosted dark card
- Social icons: col-span-2, dark card with icon buttons
- Location: col-span-2, dark card
- Bio links: each col-span-2
- Portfolio items: col-span-2 row-span-2 each
- Services: col-span-2 each with accent border
- CTA: col-span-4 with accent bg
- Every cell: rounded-2xl bg-neutral-900 border border-neutral-800

### 8. TemplateSplit — "The Magazine"
- Two-column layout on desktop (flex-row)
- Left 45%: sticky hero image (h-screen on desktop, 35vh mobile)
  - If no cover: dark gradient from-neutral-900 to-neutral-800
  - On mobile: name overlay at bottom of image
- Right 55%: scrollable content (overflow-y-auto h-screen on desktop)
  - Clean white background
  - Avatar: w-16 h-16 rounded-2xl
  - Social links as pills: flex gap-2, each with platform icon + handle text
  - Services with section header
  - Portfolio as horizontal scroll
- Editorial, magazine-like, premium feel

## After finishing
Run: openclaw system event --text "Done: All 8 templates rewritten to premium quality" --mode now
