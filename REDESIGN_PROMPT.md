# Full Dark AI/Code-Themed Redesign

Redesign the ENTIRE HireACreator.ai website to dark, nerdy, AI/code-themed aesthetic. Think AgentMail.to meets Vercel AI.

The header (components/header.tsx) is ALREADY done — dark bg, JetBrains Mono, emerald accents, terminal nav. DO NOT touch it.

## Style Guide
- Dark backgrounds: neutral-950, #0a0a0a
- JetBrains Mono for headings/labels/buttons: `style={{ fontFamily: "'JetBrains Mono', monospace" }}`
- Plus Jakarta Sans for body paragraphs
- Emerald green (#10b981, #34d399) primary accent
- Sharp corners (rounded-none or rounded-sm) on buttons/cards
- Subtle borders: border-neutral-800, border-emerald-500/20
- Terminal aesthetic: monospace, uppercase tracking-wide labels

## Files to Change (priority order)

### 1. components/homepage-content.tsx
- Dark bg throughout (neutral-950)
- Hero: "The marketplace AI agents use to hire creators"
- Code block in hero showing real API call
- Emerald typing rotation text
- Dark stat cards with monospace numbers
- Dark "How it works" cards
- Dark niche showcase with emerald badges
- Dark feature cards
- Dark FAQ accordion
- Replace ALL blue gradients with emerald/neutral
- Score demo: dark theme

### 2. components/footer.tsx
- Dark bg matching header, monospace links, emerald accents

### 3. components/pricing-content.tsx  
- Dark cards, emerald for popular plan, monospace prices, square buttons

### 4. components/for-brands-content.tsx
- Dark theme, API/code examples

### 5. components/for-creators-content.tsx
- Dark theme, terminal aesthetic

### 6. components/dashboard-content.tsx
- Dark sidebar (neutral-900), dark cards, emerald accents
- Keep ALL functionality — just restyle

### 7. app/globals.css
- Update light defaults to dark

## Rules
- bg-neutral-950 for pages, bg-neutral-900 for cards
- Buttons: rounded-none, bg-emerald-500 text-neutral-950, uppercase tracking-wide
- Text: text-white headings, text-neutral-400 body, text-emerald-400 links
- No rounded-2xl on buttons
- Cards: bg-neutral-900 border border-neutral-800

## DO NOT MODIFY
- components/header.tsx (already done)
- components/link-in-bio-content.tsx (user-facing pages)
- components/wysiwyg-editor.tsx (keep light for usability)

## When Done
1. Run: npx tsc --noEmit (fix all errors)
2. Run: git add -A
3. Run: git commit -m "feat: full dark AI themed redesign"
4. Run: git push
5. Run: openclaw system event --text "Done: Full dark redesign complete" --mode now
