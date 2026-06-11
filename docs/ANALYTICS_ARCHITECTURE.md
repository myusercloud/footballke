# Analytics Architecture

> **Status**: Phases 2–8 complete. PostHog is live. All auto-tracking is wired.
> Feature tracking covers homepage CTAs, fixture widget, navbar, and footer.
> Article and filter tracking will be added as those pages are built.

---

## Data Flow

```
User interaction
  │
  ▼
track(events.xxx({ ... }))         ← typed call site in any component
  │
  ▼
lib/analytics/analytics.ts         ← enriches with base properties
  │  isEnabled() → DNT / SSR guard
  │  buildBaseProperties() → page_path, page_title, referrer, device_type, session_id
  │
  ├──▶  AnalyticsProvider (debug)   ← notifies debug listeners (always, even without key)
  │
  └──▶  AnalyticsProvider (live)   ← only if provider is initialised
           │
           ▼
         posthog.provider.ts        ← thin PostHog wrapper
           │
           ▼
         PostHog cloud              ← events arrive here
```

The UI never imports from `posthog-js` or `posthog.provider.ts` directly.
`track()` is the only analytics function components are allowed to call.

---

## File Inventory

```
lib/analytics/
  types.ts              BaseProperties and DeviceType types
  events.ts             29-event discriminated union + events factory object
  provider.ts           AnalyticsProvider interface (capture / identify / page / reset)
  posthog.provider.ts   PostHog implementation of AnalyticsProvider
  analytics.ts          track() / identify() / page() / reset() + debug pub/sub
  hooks.ts              useAnalytics(), useScrollDepth()

components/analytics/
  AnalyticsProvider.tsx  "use client" root wrapper — init, session_start, page_view, web vitals
  AnalyticsDebugPanel.tsx  floating dev overlay (NEXT_PUBLIC_ANALYTICS_DEBUG=true only)
  TrackedLink.tsx          thin Link wrapper for server-component tracking
```

---

## Key Design Decisions

### 1 — Discriminated union for events (`events.ts`)

`AnalyticsEvent` is a TypeScript discriminated union. Each member specifies exact
required properties for that event name. Components call factory functions:

```ts
track(events.fixtureOpen({ fixture_id: "abc", home_team: "Gor Mahia", ... }));
```

TypeScript enforces that every required field is present at the call site.
Adding a new field to an event's property type causes a compile error at every
call site that's missing it — no silent gaps.

### 2 — Internal cast in `track()`

`fixture_filter_clear` has no `properties` field (it carries no payload).
The discriminated union means `event.properties` doesn't type-check across all
union members. `track()` uses one internal cast:

```ts
const props = (event as { name: string; properties?: Record<string, unknown> }).properties;
```

Callers still get full type safety. The cast is isolated to one line.

### 3 — `Promise<never>` for CMS/API provider stubs

The four `CMSxxxProvider` and `APIxxxProvider` classes throw on every method call.
Return types are `Promise<never>` — TypeScript's bottom type is assignable to any
`Promise<T>`, so the stubs satisfy the interface without importing concrete types.

### 4 — Module-level state, not React context

`_provider` and `_sessionId` live at module scope in `analytics.ts`, not in
React context. This means:

- `track()` can be called from non-React code (utility functions, event handlers)
- No context provider re-render on every event
- State survives across React Strict Mode unmount/remount cycles

The tradeoff: the provider cannot vary per subtree. That is intentional —
analytics should be a single, application-wide sink.

### 5 — Debug listeners decouple the panel from the provider

`addDebugListener()` notifies the debug panel even when no PostHog key is set.
Developers can verify tracking works locally without an account. The `captured`
field on `DebugEntry` shows whether the event actually reached PostHog.

### 6 — RAF throttle for scroll depth

`useScrollDepth` gates scroll handler execution to one check per animation frame
(`requestAnimationFrame`). This caps scroll work at ~60 checks/sec instead of
hundreds of raw scroll events per second. The RAF ID is cancelled on unmount so
the callback cannot fire on an unmounted component.

### 7 — Module-level web vitals guard

`PerformanceObserver` is a browser-level resource with no deduplication.
Calling `onCLS()` twice registers two observers. React Strict Mode calls effects
twice in development; a module-level `_vitalsRegistered` flag survives the
unmount/remount cycle and prevents double-registration.

---

## `isEnabled()` Guard

Every live analytics call passes through:

```ts
function isEnabled(): boolean {
  if (typeof window === "undefined") return false;   // SSR
  if (navigator.doNotTrack === "1") return false;    // DNT
  return _provider !== null;                          // no key set
}
```

If any guard fails, `track()` short-circuits before `buildBaseProperties()` or
PostHog are touched. Debug listeners are notified independently — they bypass
the `isEnabled()` check so the panel works without a PostHog key.

---

## Auto-Tracked Events

These require no manual `track()` calls in feature code.

| Event | Where | When |
|---|---|---|
| `session_start` | `AnalyticsProvider` | Once per browser session (`sessionStorage._fk_ss`) |
| `page_view` | `AnalyticsProvider` → `RouteWatcher` | Initial load + every client-side navigation |
| `web_vitals` | `AnalyticsProvider` | When browser reports LCP, CLS, FCP, INP, TTFB |

---

## Current Feature Tracking (Phase 6)

| Component | Events fired |
|---|---|
| `NavLinks.tsx` | `nav_click` on every nav link |
| `Footer.tsx` | `footer_link_click` — social links + contact emails |
| `app/page.tsx` — hero CTAs | `cta_click` (Read latest, View fixtures) |
| `app/page.tsx` — fixture widget | `fixture_open` with `source: "widget"` |
| `app/page.tsx` — section nav | `cta_click` (All fixtures, All stories, Full table, All transfers) |
| `app/page.tsx` — advertise CTA | `cta_click` with `type: "mailto"` |

---

## Adding a New Event

1. **Add a property type** in `lib/analytics/events.ts`:
   ```ts
   export type MyEventProperties = { field_a: string; field_b: number };
   ```

2. **Add a union member**:
   ```ts
   | { name: "my_event"; properties: MyEventProperties }
   ```

3. **Add a factory function** in the `events` object:
   ```ts
   myEvent: (properties: MyEventProperties): AnalyticsEvent => ({ name: "my_event", properties }),
   ```

4. **Call it** from the component:
   ```ts
   import { track } from "@/lib/analytics/analytics";
   import { events } from "@/lib/analytics/events";

   track(events.myEvent({ field_a: "value", field_b: 42 }));
   ```

`npx tsc --noEmit` will catch any missing or mistyped properties at build time.

---

## Adding a New Analytics Provider

1. Implement `AnalyticsProvider` from `lib/analytics/provider.ts`.
2. Add it to `providers/config.ts` if it's a data provider, or replace
   `PostHogProvider` in `AnalyticsProvider.tsx` if it's an analytics backend.
3. Pass it to `initAnalytics()`.

The rest of the codebase stays unchanged.

---

## What Is Never Tracked

Tracked by design decision, non-negotiable:

| Not tracked | Reason |
|---|---|
| Raw search input text | PII / sensitive |
| Form field values | PII |
| Email addresses | PII |
| User-agent strings | PII-adjacent; device category only |
| Scroll pixel position | Milestones (25/50/75/100) only |
| Individual user IDs | No auth today; reserved for `identify()` |
| Social share URLs with tokens | Strip query params before tracking |
| Passwords or session tokens | Never |
