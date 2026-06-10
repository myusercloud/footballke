@AGENTS.md

# FootballKE — Codebase Guide

FootballKE is a Kenyan Premier League (KPL) news, fixtures, standings, and transfers web platform. Currently a frontend prototype with hardcoded content; the architecture is designed to evolve into a dynamic, CMS-driven site.

---

## Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.9 |
| Language | TypeScript | ^5 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | ^4 |
| Fonts | Geist Sans / Geist Mono (next/font/google) | — |
| Linting | ESLint (flat config) | ^9 |
| Deployment | Vercel | — |

**Planned but not yet installed** (listed in README, not in package.json):
- shadcn/ui — UI component library
- Zustand — state management
- Motion — animations
- Recharts — charts for analytics pages
- Google AdSense — ad monetization
- Google Analytics + PostHog — analytics
- Cloudinary — image CDN

Do not assume these are available. Install them before use.

---

## Directory Structure

```
footballke/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout: fonts, metadata, html/body
│   ├── page.tsx              # Homepage (all sections, hardcoded data)
│   ├── globals.css           # Tailwind import + CSS custom properties
│   └── favicon.ico
├── components/
│   └── layout/
│       ├── Navbar.tsx        # Sticky header with FK brand + nav links
│       └── Footer.tsx        # Multi-column footer with contact/social
├── public/                   # Static assets
├── eslint.config.mjs         # ESLint v9 flat config
├── next.config.ts            # Minimal Next.js config
├── postcss.config.mjs        # @tailwindcss/postcss plugin
├── tsconfig.json             # TypeScript config
└── package.json
```

---

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

No test runner is configured. Do not add test scripts without agreement.

---

## Architecture

### App Router conventions
- All routes live under `app/`. Each folder with a `page.tsx` becomes a route.
- Shared layouts go in `layout.tsx` files at the appropriate route level.
- Metadata is exported as a `Metadata` constant from `layout.tsx` or `page.tsx`.
- Page-level metadata overrides the root layout metadata (title template: `"%s | FootballKE"`).

### Import alias
`@/*` resolves to the repository root. Use it for all non-relative imports:
```ts
import Navbar from "@/components/layout/Navbar";
```

### Component location
- Layout-level components (Navbar, Footer, Sidebar) → `components/layout/`
- When adding feature components, create `components/<feature>/` subdirectories.
- All components are Server Components by default. Add `"use client"` only when the component needs browser APIs, event handlers, or React state.

### Data layer
All content is currently **hardcoded mock data** inside `app/page.tsx`:
- `topStories` — 3 KPL news articles
- `fixtures` — 4 upcoming matches
- `table` — 9-team KPL standings
- `quickReads` — 4 opinion/analysis pieces

When migrating to dynamic data, add API routes under `app/api/` and fetch from Server Components. Do not introduce client-side data fetching patterns (SWR, React Query) until Zustand or another state layer is in place.

---

## Styling Conventions

Tailwind CSS v4 via PostCSS. No separate `tailwind.config.*` file — configuration lives in `globals.css` via the `@theme` directive.

**Color palette:**
- Primary brand: `emerald-800`, `emerald-900`
- Accent / CTA: `lime-300`, `emerald-600`
- Neutral / text: `zinc-950`, `zinc-700`, `zinc-200`
- Win badge: `emerald-600` | Draw badge: `amber-400` | Loss badge: `red-500`
- Relegation zone: `red-500` | Continental zone: `emerald-500` | Champion: `amber-400`

**Layout:**
- Max content width: `max-w-7xl mx-auto`
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Mobile-first responsive breakpoints: `sm`, `md`, `lg`

**Typography:**
- Font variables: `--font-geist-sans`, `--font-geist-mono` (set on `<html>`)
- Headlines: `font-black` (weight 900), `tracking-tight`
- Body: `text-sm` or `text-base`, `text-zinc-700`

**Accessibility:**
- Interactive elements must have `focus-visible:ring-2 focus-visible:ring-emerald-600`
- Decorative elements use `aria-hidden="true"`
- Navigation landmarks use `aria-label`
- Include a visually-hidden skip-to-content link where appropriate (`sr-only`)

---

## SEO & Metadata

Root metadata is defined in `app/layout.tsx`:
- `metadataBase`: `https://footballke.com`
- Title template: `"%s | FootballKE"`
- Open Graph locale: `en_KE`
- Robots: indexed and followed

Each page should export its own `metadata` to override the title and description. OG images should be 1200×630 and stored in `public/`.

---

## Content Domain

The platform covers **Kenyan Premier League (KPL)** football:
- Key clubs: Gor Mahia, AFC Leopards, Tusker FC, Bandari FC, Kakamega Homeboyz, Shabana, Sofapaka, Police FC, Ulinzi Stars
- Content sections: News, Fixtures, Table (standings), Transfers, Opinion
- Contact: `ads@footballke.com`, `editor@footballke.com`
- Location: Nairobi, Kenya

---

## Key Files

| File | What to know |
|---|---|
| `app/page.tsx` | 574-line homepage; contains inline helper functions (`FormBadge`, `AdSlot`, pitch SVG) and all mock data arrays. Refactor these out as the site grows. |
| `app/layout.tsx` | Sets global fonts, metadata, and the `flex min-h-full flex-col` body that makes the footer stick to the bottom. |
| `components/layout/Navbar.tsx` | Nav links currently use hash anchors (`#news`, `#fixtures`). Update to real routes when those pages exist. |
| `components/layout/Footer.tsx` | Contains hardcoded contact emails and social links. Extract to a config file when they need to be shared across the codebase. |
| `globals.css` | Tailwind v4 entry point. Add global CSS variables and `@theme` tokens here, not in a JS config. |

---

## Next.js Version Notice

This project uses **Next.js 16.2.9** with **React 19**. APIs, conventions, and file structure may differ from training data. Always verify against `node_modules/next/` source or official changelog before writing new Next.js-specific code. Heed any deprecation notices that appear during `npm run dev` or `npm run build`.
