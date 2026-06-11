# PostHog Setup Guide

---

## 1. Credentials

Your `.env.local` already has working credentials:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_o8YKe7VoQ2BbxrCm5RfXo9HZcHMWZbTw5hCS8QV48Aug
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

These values are read at **build time** (they are `NEXT_PUBLIC_` variables).
After changing them you must restart the dev server or trigger a new build.

---

## 2. Local Development

### Verify analytics is working

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Open the browser console — you should see PostHog's own debug output
   (network requests to `us.i.posthog.com`)

### Enable the debug panel

Add to `.env.local`:

```env
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

Restart the dev server. A floating panel appears in the bottom-right corner
showing every `track()` call in real time.

- **Lime** event name → captured by PostHog
- **Amber** event name → no-op'd (DNT set, SSR, no key, etc.)

Click any event row to expand its properties. Base properties (path, title,
device, session ID) are filtered out — only event-specific fields are shown.

The panel is excluded from production builds when `NEXT_PUBLIC_ANALYTICS_DEBUG`
is not `"true"`. It is also excluded from the JS bundle at the webpack level
(build-time constant), so there is no runtime cost in production.

---

## 3. Events That Fire Automatically

No manual `track()` calls are needed for these — `AnalyticsProvider` handles them:

| Event | When |
|---|---|
| `session_start` | First page load in a new browser session |
| `page_view` | Every route change (initial + client-side navigation) |
| `web_vitals` (LCP, CLS, FCP, INP, TTFB) | After each metric is measured by the browser |

---

## 4. PostHog Dashboard Setup

Log in at **app.posthog.com** with the account that owns the project key above.

### Recommended Insights to create

**Traffic overview**
- Trend: `page_view` by `page_path` — see which pages get the most traffic
- Breakdown by `device_type` — mobile vs desktop split

**Navigation patterns**
- Funnel: `page_view (/)`  → `nav_click` → `page_view (/news or /fixtures)` — measures nav conversion
- Trend: `nav_click` broken down by `label` — which section is clicked most

**Fixture engagement**
- Trend: `fixture_open` broken down by `home_team` / `away_team` — most-clicked fixtures
- Trend: `fixture_open` broken down by `source` — widget vs card vs hero

**Content consumption**
- Trend: `article_view` by `category` — most-read categories
- Funnel: `article_view` → `scroll_depth (depth=100)` — completion rate per category

**Web Vitals health**
- Trend: `web_vitals` filtered by `metric = LCP`, breakdown by `rating` — share of good/poor scores
- Trend: `web_vitals` filtered by `metric = CLS` — layout stability over time

**CTAs**
- Trend: `cta_click` broken down by `label` — most-clicked CTAs
- Trend: `footer_link_click` broken down by `type` — social vs contact clicks

### Recommended Session Recordings filter

Add the property filter `session_id is set` — recordings are linked to the
same anonymous session ID used in events, so you can jump from a funnel drop-off
to the recording of a real session where it happened.

---

## 5. Privacy Configuration

Current settings in `posthog.provider.ts`:

| Setting | Value | Effect |
|---|---|---|
| `capture_pageview` | `false` | PostHog's auto-capture disabled; we fire `$pageview` manually |
| `capture_pageleave` | `true` | Fires `$pageleave` when users navigate away |
| `autocapture` | `false` | No automatic click/input tracking — all events are explicit |
| `persistence` | `"localStorage+cookie"` | Standard session persistence |

### Before launch: review these settings

1. **Cookie consent** — If the site needs a consent banner (GDPR), change
   `persistence` to `"memory"` until consent is granted, then switch to
   `"localStorage+cookie"`. PostHog has a consent API for this.

2. **IP masking** — Go to PostHog → Project Settings → Privacy and enable
   "Mask IPs". This is not set in code — it's a project-level setting in the
   PostHog dashboard.

3. **EU data residency** — The current host is `us.i.posthog.com`. For EU
   data residency, create a new project at `eu.posthog.com`, get a new key,
   and set:
   ```env
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```

4. **Do Not Track** — Already handled in `analytics.ts`. If `navigator.doNotTrack === "1"`,
   all tracking is silently disabled at the `isEnabled()` check.

---

## 6. Deployment

`NEXT_PUBLIC_*` variables must be set in the environment at **build time**:

**Vercel** (recommended)
- Project Settings → Environment Variables
- Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Production and Preview environments can have different keys (use a separate
  PostHog project for Preview to keep production data clean)

**Preview deploys**
- Leave `NEXT_PUBLIC_POSTHOG_KEY` blank in Preview environment variables —
  analytics will silently no-op without a key. No errors.

**CI / build pipelines**
- Same: omit the key. `initAnalytics(null)` is called; no PostHog SDK calls happen.

---

## 7. Key Rotation

If the PostHog key needs to be rotated:

1. Create a new API key in PostHog → Project Settings → Project API Keys
2. Update `NEXT_PUBLIC_POSTHOG_KEY` in Vercel environment variables
3. Trigger a new production deployment (build-time variable — requires rebuild)
4. Revoke the old key in PostHog after verifying events are arriving on the new key

---

## 8. Troubleshooting

**No events appearing in PostHog**
- Check the browser console for PostHog network errors (requests to `us.i.posthog.com`)
- Ensure `NEXT_PUBLIC_POSTHOG_KEY` is set and the build was restarted after adding it
- Check that an ad blocker is not blocking PostHog requests
- Enable `NEXT_PUBLIC_ANALYTICS_DEBUG=true` — if events appear in the panel but not PostHog, the key is wrong or blocked

**Panel shows amber (no-op) events only**
- The provider is not initialised — check that `NEXT_PUBLIC_POSTHOG_KEY` is set and non-empty in `.env.local`

**`session_start` fires multiple times in dev**
- React Strict Mode runs effects twice. In production, `session_start` fires exactly once per browser session, guarded by `sessionStorage._fk_ss`

**Web vitals not appearing**
- Web vitals are fired when the browser finishes measuring them — LCP typically
  arrives a few seconds after the page loads; CLS accumulates over the session.
  Check PostHog a minute after opening the page, not immediately.
