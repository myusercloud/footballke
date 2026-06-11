# Analytics Implementation Report

> **Completed**: 2026-06-11
> **Phases**: 1–10 (all complete)
> **Build**: ✓ 43 pages, 0 TypeScript errors, 0 new lint errors

---

## Validation Results

### Build

```
▲ Next.js 16.2.9 (Turbopack)

✓ Compiled successfully in 26.4s
✓ TypeScript: 0 errors
✓ Static pages: 43 generated

Routes added/changed: none (analytics is a pure add-on layer)
```

### Type checking

```
npx tsc --noEmit → exit 0 (no output)
```

All 29 event types, 9 analytics files, 3 modified feature components, and the
new `TrackedLink` wrapper are fully typed. TypeScript enforces required
properties at every `track()` call site.

### Lint

```
npm run lint → 1 pre-existing error (Navbar.tsx <a> vs <Link>)
              13 pre-existing warnings in non-analytics files
               0 errors or warnings introduced by analytics work
```

The Navbar error pre-dates this implementation. No analytics file produces a
lint warning.

### Architecture integrity

| Check | Result |
|---|---|
| `posthog-js` imported only in `posthog.provider.ts` | ✓ |
| No `track()` call in a server component (direct) | ✓ — server components use `TrackedLink` |
| `page_view` fires exactly once per navigation | ✓ — `RouteWatcher` guards first mount |
| Web vitals registered exactly once | ✓ — module-level `_vitalsRegistered` flag |
| Debug panel excluded from production build | ✓ — build-time constant gating |
| `navigator.doNotTrack` respected | ✓ — `isEnabled()` check |
| No PII collected | ✓ — device type, not user-agent; slug, not raw text |

---

## Files Created

### `lib/analytics/` — Core layer (737 lines total)

| File | Lines | Purpose |
|---|---|---|
| `types.ts` | 20 | `BaseProperties`, `DeviceType` |
| `provider.ts` | 38 | `AnalyticsProvider` interface |
| `events.ts` | 135 | 29-event discriminated union + factory object |
| `analytics.ts` | 148 | `track()`, `identify()`, `page()`, `reset()`, debug pub/sub |
| `hooks.ts` | 70 | `useAnalytics()`, `useScrollDepth()` with RAF throttle |
| `posthog.provider.ts` | 41 | PostHog implementation of `AnalyticsProvider` |

### `components/analytics/` — UI layer (285 lines total)

| File | Lines | Purpose |
|---|---|---|
| `AnalyticsProvider.tsx` | 124 | Root wrapper: init, session_start, page_view, web vitals |
| `AnalyticsDebugPanel.tsx` | 139 | Dev-only floating event inspector |
| `TrackedLink.tsx` | 22 | Thin client wrapper for server-component tracking |

### `docs/` — Documentation

| File | Purpose |
|---|---|
| `ANALYTICS_PLAN.md` | Phase 1 audit and specification (pre-implementation) |
| `ANALYTICS_ARCHITECTURE.md` | Architecture, design decisions, extension guide |
| `TRACKING_EVENTS.md` | All 29 events — call signatures, property tables, quick reference |
| `POSTHOG_SETUP.md` | Credentials, debug panel, dashboard setup, privacy, deployment |

---

## Files Modified

| File | Change | Net lines |
|---|---|---|
| `app/layout.tsx` | Swapped `PostHogProvider` → `AnalyticsProvider` | 0 |
| `app/providers.tsx` | Gutted direct PostHog calls; now a re-export stub | −38 |
| `app/page.tsx` | 9 `Link`/`<a>` → `TrackedLink` + 2 imports | +21 |
| `components/layout/NavLinks.tsx` | Added `onClick` + 2 imports | +4 |
| `components/layout/Footer.tsx` | Added `"use client"` + 3 `onClick` handlers | +12 |
| `.env.example` | Created from scratch with all env vars documented | new |

---

## Event Coverage

### Auto-tracked (zero manual calls in feature code)

| Event | Mechanism |
|---|---|
| `session_start` | `AnalyticsProvider` useEffect, guarded by `sessionStorage._fk_ss` |
| `page_view` | Initial: `AnalyticsProvider`; subsequent: `RouteWatcher` |
| `web_vitals` (×5) | `web-vitals` dynamic import, one report per metric |

### Homepage feature tracking

| Interaction | Event | Properties |
|---|---|---|
| Nav link click | `nav_click` | label, destination |
| Footer social click | `footer_link_click` | label, destination, type=social |
| Footer email click | `footer_link_click` | label, destination, type=contact |
| "Read latest" CTA | `cta_click` | label, destination, type=internal |
| "View fixtures" CTA | `cta_click` | label, destination, type=internal |
| Fixture widget card | `fixture_open` | fixture_id, home_team, away_team, source=widget |
| "All fixtures →" | `cta_click` | label, destination, type=internal |
| "All stories →" | `cta_click` | label, destination, type=internal |
| "Full table" | `cta_click` | label, destination, type=internal |
| "All transfers" | `cta_click` | label, destination, type=internal |
| Advertise CTA | `cta_click` | label, destination, type=mailto |
| Scroll milestones | `scroll_depth` | depth (25/50/75/100), page_type |

### Ready to wire (events defined, components not yet built)

These events are fully typed in `events.ts` and will be added as pages are built:

`article_view`, `article_complete`, `article_share`, `related_article_click`,
`fixture_view`, `standings_view`, `transfer_view`, `club_view`, `player_view`,
`category_filter`, `fixture_filter`, `fixture_filter_clear`,
`standings_filter`, `transfers_filter`, `pagination_click`, `search`,
`session_end`, `ad_impression`, `ad_click`, `image_load`, `error`

---

## Performance Characteristics

| Concern | Resolution |
|---|---|
| Scroll event frequency | RAF throttle in `useScrollDepth` — max 1 check per frame (~16 ms) |
| Web vitals double-registration | Module-level `_vitalsRegistered` flag survives Strict Mode cycles |
| Provider re-init on Strict Mode remount | `initAnalytics(null)` returned from useEffect cleanup |
| Debug panel in production | Gated by build-time `NEXT_PUBLIC_ANALYTICS_DEBUG` constant — tree-shaken |
| PostHog in bundle when key missing | `initAnalytics(null)` prevents any PostHog calls; SDK still in bundle |
| Client boundary bloat | Server components use `TrackedLink` island; Footer is leaf with no data fetching |

---

## Design Decisions

### Why discriminated union, not string + object?

A loose `{ name: string; properties?: Record<string, unknown> }` type lets you
call `track({ name: "articl_view", properties: { slg: "..." } })` with two typos
and no compile error. The discriminated union catches both — wrong event name and
wrong/missing property — at the call site, not in the PostHog dashboard days later.

### Why module-level state, not React context?

`track()` is callable from anywhere — event handlers, utility functions, future
API route handlers. Context would restrict it to component trees. Module-level
state also means no React re-render cost when the provider initialises.

### Why `TrackedLink` instead of making server components client?

`app/page.tsx` is an async server component that does `Promise.all` data
fetching. Converting it to a client component would eliminate server-side data
fetching for the whole homepage. `TrackedLink` is a 22-line client island — the
data fetching stays on the server, only the click handler hydrates client-side.

### Why both `page()` and `track(events.pageView())`?

`page()` → `posthog.capture("$pageview", ...)` feeds PostHog's built-in session
and funnel analysis (which keys on `$pageview` specifically).
`track(events.pageView())` fires our custom `page_view` for dashboards that
group all FK events by name. They are complementary, not redundant.

---

## What Is Not Tracked (by design)

| Data | Why excluded |
|---|---|
| Raw search queries | PII/sensitive — fire only on submit, not keystroke |
| Form field values | Not applicable today; constraint documented for future |
| User-agent strings | PII-adjacent — `device_type` (mobile/tablet/desktop) used instead |
| Scroll pixel position | Milestones only (25/50/75/100%) |
| Email addresses | PII |
| Session tokens, passwords | Never |
| Individual user IDs | No auth today; `identify()` reserved for future login flow |

---

## Next Steps

1. **Wire remaining events as pages are built**: use `docs/TRACKING_EVENTS.md`
   as the call-site reference. TypeScript will enforce every required property.

2. **Cookie consent**: before launch, add a consent banner and switch PostHog
   `persistence` from `"localStorage+cookie"` to `"memory"` until consent is
   granted. See `docs/POSTHOG_SETUP.md §5`.

3. **IP masking**: enable in PostHog dashboard → Project Settings → Privacy.

4. **Build PostHog dashboards**: recommended insights in `docs/POSTHOG_SETUP.md §4`.

5. **Ad tracking**: wire `ad_impression` (IntersectionObserver) and `ad_click`
   to `AdSlot.tsx` when an ad network is integrated.

6. **Error boundary**: add a React error boundary that calls
   `track(events.error({ message, component }))` — this is the last P2 event
   not yet wired.
