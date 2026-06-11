# Analytics Plan

> **Status**: Phase 1 complete — pre-implementation specification.
> No code has been modified. This document drives Phases 2–10.
>
> Generated from a full repository audit on 2026-06-11.

---

## Executive Summary

FootballKE has zero analytics instrumentation today. The `.env.local` file has
an empty `NEXT_PUBLIC_ANALYTICS_ID=` placeholder — the intention was always
there. The codebase is well-structured for adding analytics centrally:

- All filtering is URL-driven (query params), so filter events are trivial
- Five existing `"use client"` components are the natural home for interaction
  events — no new client boundaries needed
- Rich page metadata (title, author, tags, JSON-LD) is already built and can
  feed analytics context automatically
- Five ad slots are defined and ready for impression tracking

**Implementation principle**: Analytics must be a separate layer, not sprinkled
calls. A single `track()` function is the only interface the UI ever touches.

---

## What to Track and Why

### Navigation (understand how users move through the site)

Traffic sources, page popularity, and navigation paths are the most fundamental
analytics signal for a content site. They answer: which content is read, in
what order, from where?

**Priority: P0** — must work on day one or analytics has no value.

### Article engagement (understand content performance)

For a news platform, content performance is the core business signal. Which
articles are read to completion? Which are abandoned? Which are shared? This
data drives editorial decisions: cover image quality, article length, topic
selection.

**Priority: P1**

### Filter and sort interactions (understand user intent)

Fixtures and standings filters reveal team and competition preferences across
the user base. The most-filtered team or competition is the most valuable
content slot. Filter usage also identifies UX problems: if users apply a filter
then immediately clear it, the filter UX may be confusing.

**Priority: P1**

### Scroll depth (understand content consumption)

Combined with `article_view`, scroll depth answers: "of users who opened this
article, what fraction actually read it?" A high view count with low completion
rate means the headline over-promised the content.

**Priority: P1**

### Ad interactions (future revenue signal)

Five ad slots exist today. No ad network is wired up, but tracking impressions
and clicks now means the data is ready when a network is added. Impression data
answers which positions are most visible, which informs pricing.

**Priority: P2** — implement but low urgency until ad network is live.

### Share events (viral coefficient)

The ShareButtons component already exists with Twitter/X, WhatsApp, and
copy-link. Tracking these tells you what content is being distributed and
through which channel — actionable for social strategy.

**Priority: P1**

### Web vitals / performance (user experience baseline)

LCP, CLS, and TTFB directly affect SEO ranking and user retention. Tracking
them in analytics means performance regressions are caught in the same tool
as engagement regressions.

**Priority: P2**

### Errors (operational health)

Client-side errors surface in analytics before they reach error monitoring
tools. Tracking them here gives context: which page, which article, which
user flow was interrupted.

**Priority: P2**

---

## What NOT to Track

This list is non-negotiable. It exists because analytics must remain GDPR-
compatible and because the DO NOT section in the implementation spec is explicit.

| Do not track | Reason |
|---|---|
| Search input text | Raw text — personal/sensitive |
| Article text selected | Content interaction, not needed |
| Scroll pixel position | Only depth milestones (25/50/75/100) |
| Email addresses | PII |
| User-agent strings | PII-adjacent; use device category only |
| Form field values | Not applicable today; never applicable |
| IP addresses | Handled by PostHog (masked by default) |
| Individual user identification without consent | GDPR |
| Social share URLs containing user tokens | Strip query params |

---

## Event Taxonomy

Events are grouped into five categories. Each event name is a `snake_case`
string. Each event carries a standard set of base properties (injected
automatically) plus event-specific properties.

### Base properties (on every event)

```typescript
{
  page_path: string;        // e.g. "/news/gor-mahia-signs-striker"
  page_title: string;       // document.title at time of event
  referrer: string;         // document.referrer (empty string if direct)
  device_type: "mobile" | "tablet" | "desktop";
  session_id: string;       // anonymous UUID, per-session, not per-user
}
```

### Category 1 — Navigation

| Event | Trigger | Properties |
|---|---|---|
| `page_view` | Route change (auto) | `path`, `title`, `referrer`, `from_path` |
| `nav_click` | NavLinks link clicked | `label` (News/Fixtures/Table/Transfers/Opinion), `destination` |
| `footer_link_click` | Footer link clicked | `label`, `destination`, `type` (social/nav/contact) |

### Category 2 — Content

| Event | Trigger | Properties |
|---|---|---|
| `article_view` | Article page loads | `slug`, `title`, `category`, `author`, `tags[]`, `reading_time_mins`, `published_at` |
| `article_complete` | Scroll depth hits 100% on article | `slug`, `title`, `category`, `time_on_page_secs` |
| `article_share` | ShareButtons clicked | `slug`, `title`, `platform` (twitter/whatsapp/copy) |
| `related_article_click` | Related article card clicked | `from_slug`, `to_slug`, `position` (1-based index) |
| `fixture_view` | Fixture detail page loads | `fixture_id`, `home_team`, `away_team`, `competition`, `status`, `kickoff_date` |
| `transfer_view` | Individual transfer card impression | `player_name`, `from_club`, `to_club`, `status`, `window` |

### Category 3 — Engagement

| Event | Trigger | Properties |
|---|---|---|
| `category_filter` | News category chip clicked | `category_slug`, `category_name` |
| `fixture_filter` | Fixture filter applied | `competition_slug?`, `team_slug?`, `date_from?`, `date_to?`, `filter_count` |
| `fixture_filter_clear` | Clear filters clicked | — |
| `standings_filter` | Standings filter changed | `field` (competition/season/sort), `value` |
| `transfers_filter` | Transfer filter changed | `field` (status/window/club), `value` |
| `pagination_click` | Any pagination control clicked | `page`, `section` (news/fixtures) |
| `scroll_depth` | Scroll milestone reached | `depth` (25/50/75/100), `page_type` (article/list/home) |
| `cta_click` | Advertise / contact CTA clicked | `label`, `destination`, `type` (mailto/internal) |

### Category 4 — Revenue

| Event | Trigger | Properties |
|---|---|---|
| `ad_impression` | Ad slot enters viewport | `slot_label`, `slot_size`, `page_path` |
| `ad_click` | Ad slot clicked | `slot_label`, `slot_size`, `page_path` |

### Category 5 — Performance

| Event | Trigger | Properties |
|---|---|---|
| `web_vitals` | Core Web Vitals measured | `metric` (LCP/CLS/TTFB/FCP/INP), `value`, `rating` (good/needs-improvement/poor) |
| `error` | Uncaught client error | `message`, `page_path`, `component?` |
| `session_start` | First event of a session | `referrer`, `device_type`, `landing_page` |

---

## Priority Matrix

| Priority | Events | Rationale |
|---|---|---|
| **P0** | `page_view`, `session_start` | Zero analytics value without these |
| **P1** | `article_view`, `article_complete`, `article_share`, `nav_click`, `fixture_filter`, `standings_filter`, `transfers_filter`, `scroll_depth`, `category_filter` | Core business questions answered |
| **P2** | `fixture_view`, `related_article_click`, `pagination_click`, `web_vitals`, `error`, `footer_link_click` | Useful once P1 baseline is stable |
| **P3** | `ad_impression`, `ad_click`, `cta_click`, `transfer_view` | Activated when ad network goes live |

All events will be implemented; priority determines what to validate first
in PostHog dashboards.

---

## Where Each Event Fires (Implementation Map)

This is the most important section for the "no scattered calls" requirement.
Every event traces back to a specific, bounded location.

### Auto-tracked (no manual calls in feature code)

| Event | Implementation location |
|---|---|
| `page_view` | `AnalyticsProvider` in `app/layout.tsx` — watches `usePathname()` |
| `session_start` | `AnalyticsProvider` — fires once on first page_view |
| `web_vitals` | `useReportWebVitals` hook in `app/layout.tsx` (Next.js built-in) |
| `scroll_depth` | `useScrollDepth()` hook, called from per-page wrappers |

### In existing `"use client"` components (no new client boundaries)

| Event | Component |
|---|---|
| `nav_click` | `components/layout/NavLinks.tsx` |
| `category_filter` | `components/football/news/CategoryFilter.tsx` |
| `pagination_click` | `components/football/news/Pagination.tsx` |
| `fixture_filter`, `fixture_filter_clear` | `components/football/fixtures/FixtureFilters.tsx` |
| `standings_filter` | `components/football/standings/StandingsFilters.tsx` |
| `transfers_filter` | `components/football/transfers/TransferFilters.tsx` |
| `article_share` | `components/football/news/ShareButtons.tsx` |
| `footer_link_click` | `components/layout/Footer.tsx` (will need `"use client"`) |

### In thin client wrapper components (new, small)

| Event | Where |
|---|---|
| `article_view`, `article_complete`, `scroll_depth` | `ArticleTracker` — thin wrapper around article page content |
| `fixture_view` | `FixtureTracker` — thin wrapper in fixture detail page |
| `related_article_click` | `RelatedArticles.tsx` — add onClick handler to existing links |
| `ad_impression`, `ad_click` | `AdSlot.tsx` — add IntersectionObserver + onClick |
| `cta_click` | Specific CTA elements where they appear |
| `error` | Error boundary component |

---

## Architecture Overview

```
app/layout.tsx
  └── <AnalyticsProvider>          initialises PostHog once; auto-tracks
        ├── page_view               page_view on every pathname change
        ├── session_start           once per session
        └── web_vitals              via useReportWebVitals

lib/analytics/
  ├── types.ts                      AnalyticsEvent union type
  ├── events.ts                     typed event factory functions
  ├── provider.ts                   AnalyticsProvider interface
  ├── posthog.provider.ts           PostHog implementation
  ├── analytics.ts                  track() / identify() / page() / reset()
  └── hooks.ts                      useScrollDepth(), useAnalytics()

"use client" components
  └── call track(events.xxxEvent({...}))   ← only API they ever touch
```

The UI never imports from `posthog.provider.ts` or the PostHog SDK directly.
Everything routes through `track()`.

---

## Privacy Approach

- **No PII collected by default.** Anonymous session IDs only.
- **Device type** (`mobile`/`tablet`/`desktop`) derived from viewport — not user-agent.
- **IP masking** enabled in PostHog configuration.
- **No cross-site tracking.** PostHog in-EU region or custom proxy to avoid ad-blocker false positives.
- **No cookies unless user consents.** PostHog supports cookieless mode with
  `persistence: "memory"` — use this until a cookie banner is in place.
- **`do_not_track` respected.** Check `navigator.doNotTrack` in `analytics.ts`
  and disable tracking if set.

---

## Open Questions (to resolve before Phase 4)

1. **PostHog region**: EU cloud (`eu.posthog.com`) or US cloud? EU recommended
   for GDPR compliance without a data processing agreement review.

2. **Cookie consent**: Will there be a consent banner before launch? If not,
   ship with `persistence: "memory"` (session-only, no cookies).

3. **Ad slot implementation**: The current `AdSlot` component is a placeholder.
   Impression tracking should be deferred until a real ad network is wired up
   (P3 priority confirmed).

4. **Per-domain CONTENT_SOURCE**: The analytics layer is purely client-side and
   has no dependency on the provider layer — no interaction between the two.
