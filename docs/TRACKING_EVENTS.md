# Tracking Events Reference

All events are fired via `track(events.xxx({ ... }))`. Every event receives
**base properties** automatically — they are never passed manually.

## Base Properties (on every event)

| Property | Type | Source |
|---|---|---|
| `page_path` | `string` | `window.location.pathname + search` |
| `page_title` | `string` | `document.title` |
| `referrer` | `string` | `document.referrer` (empty if direct) |
| `device_type` | `"mobile" \| "tablet" \| "desktop"` | viewport width |
| `session_id` | `string` | anonymous UUID in `sessionStorage._fk_sid` |

---

## Navigation

### `page_view`
Fires on initial load and every client-side route change.
Auto-fired by `AnalyticsProvider` — do not call manually.

```ts
track(events.pageView())
track(events.pageView({ from_path: "/news" }))
```

| Property | Type | Required |
|---|---|---|
| `from_path` | `string` | No |

---

### `nav_click`
Fires when a primary navigation link is clicked.

```ts
track(events.navClick({ label: "Fixtures", destination: "/fixtures" }))
```

| Property | Type | Values |
|---|---|---|
| `label` | `string` | `"News" \| "Fixtures" \| "Table" \| "Transfers" \| "Opinion"` |
| `destination` | `string` | href of the link |

---

### `footer_link_click`
Fires when a footer link is clicked.

```ts
track(events.footerLinkClick({ label: "Twitter", destination: "#", type: "social" }))
track(events.footerLinkClick({ label: "ads@footballke.com", destination: "mailto:...", type: "contact" }))
```

| Property | Type | Values |
|---|---|---|
| `label` | `string` | display text of the link |
| `destination` | `string` | href |
| `type` | `string` | `"social" \| "nav" \| "contact"` |

---

## Content

### `article_view`
Fires when an article detail page loads. Include full metadata.

```ts
track(events.articleView({
  slug: "gor-mahia-signs-striker",
  title: "Gor Mahia Signs Ugandan Striker",
  category: "transfers",
  author: "James Omondi",
  tags: ["Gor Mahia", "transfers", "KPL"],
  reading_time_mins: 4,
  published_at: "2026-06-10T09:00:00Z",
}))
```

| Property | Type |
|---|---|
| `slug` | `string` |
| `title` | `string` |
| `category` | `string` |
| `author` | `string` |
| `tags` | `string[]` |
| `reading_time_mins` | `number` |
| `published_at` | `string` (ISO 8601) |

---

### `article_complete`
Fires when the user scrolls to 100% on an article. Use with `useScrollDepth`.

```ts
track(events.articleComplete({
  slug: "gor-mahia-signs-striker",
  title: "Gor Mahia Signs Ugandan Striker",
  category: "transfers",
  time_on_page_secs: 183,
}))
```

| Property | Type |
|---|---|
| `slug` | `string` |
| `title` | `string` |
| `category` | `string` |
| `time_on_page_secs` | `number` |

---

### `article_share`
Fires when a share button is clicked on an article.

```ts
track(events.articleShare({ slug: "...", title: "...", platform: "whatsapp" }))
```

| Property | Type | Values |
|---|---|---|
| `slug` | `string` | |
| `title` | `string` | |
| `platform` | `string` | `"twitter" \| "whatsapp" \| "copy"` |

---

### `related_article_click`
Fires when the user clicks a related article from within an article page.

```ts
track(events.relatedArticleClick({ from_slug: "...", to_slug: "...", position: 2 }))
```

| Property | Type | Notes |
|---|---|---|
| `from_slug` | `string` | current article |
| `to_slug` | `string` | destination article |
| `position` | `number` | 1-based index in the related list |

---

### `fixture_view`
Fires when a fixture detail page loads.

```ts
track(events.fixtureView({
  fixture_id: "fix-001",
  home_team: "Gor Mahia",
  away_team: "AFC Leopards",
  competition: "kpl",
  status: "scheduled",
  kickoff_date: "2026-06-14T15:00:00+03:00",
}))
```

| Property | Type |
|---|---|
| `fixture_id` | `string` |
| `home_team` | `string` |
| `away_team` | `string` |
| `competition` | `string` |
| `status` | `string` |
| `kickoff_date` | `string` (ISO 8601) |

---

### `fixture_open`
Fires when a fixture card is clicked from a list or widget.

```ts
track(events.fixtureOpen({
  fixture_id: "fix-001",
  home_team: "Gor Mahia",
  away_team: "AFC Leopards",
  source: "widget",
}))
```

| Property | Type | Values |
|---|---|---|
| `fixture_id` | `string` | |
| `home_team` | `string` | |
| `away_team` | `string` | |
| `source` | `string` | `"card" \| "hero" \| "widget"` |

---

### `standings_view`
Fires when the standings page or widget loads.

```ts
track(events.standingsView({ competition: "kpl", season: "2025-26", sort_by: "points" }))
```

| Property | Type |
|---|---|
| `competition` | `string` |
| `season` | `string` |
| `sort_by` | `string` |

---

### `transfer_view`
Fires when a transfer record is viewed (detail page or card impression).

```ts
track(events.transferView({
  player_name: "John Doe",
  from_club: "Tusker FC",
  to_club: "Gor Mahia",
  status: "confirmed",
  window: "summer-2026",
}))
```

| Property | Type |
|---|---|
| `player_name` | `string` |
| `from_club` | `string` |
| `to_club` | `string` |
| `status` | `string` |
| `window` | `string` |

---

### `club_view`
Fires when a club profile page loads.

```ts
track(events.clubView({ club_slug: "gor-mahia", club_name: "Gor Mahia" }))
```

---

### `player_view`
Fires when a player profile page loads.

```ts
track(events.playerView({ player_id: "p-001", player_name: "John Doe", club_slug: "gor-mahia" }))
```

---

## Engagement

### `category_filter`
Fires when a news category chip is selected.

```ts
track(events.categoryFilter({ category_slug: "opinion", category_name: "Opinion" }))
```

---

### `fixture_filter`
Fires when a fixture filter is applied.

```ts
track(events.fixtureFilter({
  competition_slug: "kpl",
  team_slug: "gor-mahia",
  filter_count: 2,
}))
```

| Property | Type | Required |
|---|---|---|
| `competition_slug` | `string` | No |
| `team_slug` | `string` | No |
| `date_from` | `string` | No |
| `date_to` | `string` | No |
| `filter_count` | `number` | **Yes** — total active filters |

---

### `fixture_filter_clear`
Fires when all fixture filters are cleared. Carries no properties.

```ts
track(events.fixtureFilterClear())
```

---

### `standings_filter`

```ts
track(events.standingsFilter({ field: "season", value: "2024-25" }))
```

| Property | Type | Values |
|---|---|---|
| `field` | `string` | `"competition" \| "season" \| "sort"` |
| `value` | `string` | the selected value |

---

### `transfers_filter`

```ts
track(events.transfersFilter({ field: "window", value: "summer-2026" }))
```

| Property | Type | Values |
|---|---|---|
| `field` | `string` | `"status" \| "window" \| "club"` |
| `value` | `string` | |

---

### `pagination_click`

```ts
track(events.paginationClick({ page: 2, section: "news" }))
```

| Property | Type | Values |
|---|---|---|
| `page` | `number` | 1-based page number |
| `section` | `string` | `"news" \| "fixtures" \| "transfers"` |

---

### `scroll_depth`
Auto-fired by `useScrollDepth()`. Do not call manually.

```ts
// Inside useScrollDepth — not a manual call
track(events.scrollDepth({ depth: 75, page_type: "article" }))
```

| Property | Type | Values |
|---|---|---|
| `depth` | `number` | `25 \| 50 \| 75 \| 100` |
| `page_type` | `string` | `"article" \| "list" \| "home"` or any string |

---

### `search`

```ts
track(events.search({ query: "Gor Mahia", results_count: 12, section: "news" }))
```

Note: `query` must be the search intent, not free-form input. Do **not** track
raw text typed before the user submits. Fire only on submit.

| Property | Type |
|---|---|
| `query` | `string` |
| `results_count` | `number` |
| `section` | `string` |

---

### `cta_click`

```ts
track(events.ctaClick({ label: "Read latest", destination: "/news", type: "internal" }))
track(events.ctaClick({ label: "ads@footballke.com", destination: "mailto:...", type: "mailto" }))
```

| Property | Type | Values |
|---|---|---|
| `label` | `string` | button or link text |
| `destination` | `string` | href |
| `type` | `string` | `"mailto" \| "internal" \| "external"` |

---

### `session_start`
Auto-fired by `AnalyticsProvider` once per browser session. Do not call manually.

| Property | Type |
|---|---|
| `landing_page` | `string` |
| `referrer` | `string` |
| `device_type` | `"mobile" \| "tablet" \| "desktop"` |

---

### `session_end`
Fire when you have reliable session-end detection (e.g. `visibilitychange`).
Not auto-fired today.

```ts
track(events.sessionEnd({ duration_secs: 240, page_count: 5 }))
```

---

## Revenue

### `ad_impression`
Fires when an ad slot enters the viewport. Wire to an `IntersectionObserver`
in `AdSlot.tsx` when a real ad network is integrated.

```ts
track(events.adImpression({ slot_label: "Top banner", slot_size: "970 × 90" }))
```

---

### `ad_click`
Fires when a user clicks an ad slot.

```ts
track(events.adClick({ slot_label: "Sidebar ad", slot_size: "300 × 250" }))
```

---

## Performance

### `web_vitals`
Auto-fired by `AnalyticsProvider` via the `web-vitals` library. Do not call manually.

| Property | Type | Values |
|---|---|---|
| `metric` | `string` | `"LCP" \| "CLS" \| "TTFB" \| "FCP" \| "INP"` |
| `value` | `number` | raw metric value (ms for time-based, unitless for CLS) |
| `rating` | `string` | `"good" \| "needs-improvement" \| "poor"` |

---

### `image_load`

```ts
track(events.imageLoad({ src: "/og-image.png", duration_ms: 120, success: true }))
```

---

### `error`
Fire from an error boundary or global error handler.

```ts
track(events.error({ message: "Failed to fetch fixtures", component: "FixturesPage" }))
```

| Property | Type | Required |
|---|---|---|
| `message` | `string` | **Yes** — sanitised, no user input |
| `component` | `string` | No |

---

## Factory Quick Reference

```ts
import { track } from "@/lib/analytics/analytics";
import { events } from "@/lib/analytics/events";

// Navigation
track(events.pageView())
track(events.navClick({ label, destination }))
track(events.footerLinkClick({ label, destination, type }))

// Content
track(events.articleView({ slug, title, category, author, tags, reading_time_mins, published_at }))
track(events.articleComplete({ slug, title, category, time_on_page_secs }))
track(events.articleShare({ slug, title, platform }))
track(events.relatedArticleClick({ from_slug, to_slug, position }))
track(events.fixtureView({ fixture_id, home_team, away_team, competition, status, kickoff_date }))
track(events.fixtureOpen({ fixture_id, home_team, away_team, source }))
track(events.standingsView({ competition, season, sort_by }))
track(events.transferView({ player_name, from_club, to_club, status, window }))
track(events.clubView({ club_slug, club_name }))
track(events.playerView({ player_id, player_name, club_slug }))

// Engagement
track(events.categoryFilter({ category_slug, category_name }))
track(events.fixtureFilter({ filter_count, competition_slug?, team_slug?, date_from?, date_to? }))
track(events.fixtureFilterClear())
track(events.standingsFilter({ field, value }))
track(events.transfersFilter({ field, value }))
track(events.paginationClick({ page, section }))
track(events.scrollDepth({ depth, page_type }))   // use useScrollDepth() instead
track(events.search({ query, results_count, section }))
track(events.ctaClick({ label, destination, type }))
track(events.sessionStart({ landing_page, referrer, device_type }))   // auto
track(events.sessionEnd({ duration_secs, page_count }))

// Revenue
track(events.adImpression({ slot_label, slot_size }))
track(events.adClick({ slot_label, slot_size }))

// Performance
track(events.webVitals({ metric, value, rating }))   // auto
track(events.imageLoad({ src, duration_ms, success }))
track(events.error({ message, component? }))
```
