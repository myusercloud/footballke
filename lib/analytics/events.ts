// ── Event property types ──────────────────────────────────────────────────────
// Exported so components can type their own handler parameters if needed.
// Components call track(events.xxx({...})) — they never build raw objects.

// Navigation
export type PageViewProperties     = { from_path?: string };
export type NavClickProperties     = { label: "News" | "Fixtures" | "Table" | "Clubs" | "Transfers" | "Opinion"; destination: string };
export type FooterLinkClickProperties = { label: string; destination: string; type: "social" | "nav" | "contact" };

// Content
export type ArticleViewProperties  = { slug: string; title: string; category: string; author: string; tags: string[]; reading_time_mins: number; published_at: string };
export type ArticleCompleteProperties = { slug: string; title: string; category: string; time_on_page_secs: number };
export type ArticleShareProperties = { slug: string; title: string; platform: "twitter" | "whatsapp" | "copy" };
export type RelatedArticleClickProperties = { from_slug: string; to_slug: string; position: number };
export type FixtureViewProperties  = { fixture_id: string; home_team: string; away_team: string; competition: string; status: string; kickoff_date: string };
export type FixtureOpenProperties  = { fixture_id: string; home_team: string; away_team: string; source: "card" | "hero" | "widget" };
export type StandingsViewProperties = { competition: string; season: string; sort_by: string };
export type TransferViewProperties = { player_name: string; from_club: string; to_club: string; status: string; window: string };
export type ClubViewProperties     = { club_slug: string; club_name: string };
export type PlayerViewProperties   = { player_id: string; player_name: string; club_slug: string };

// Engagement
export type CategoryFilterProperties  = { category_slug: string; category_name: string };
export type FixtureFilterProperties   = { competition_slug?: string; team_slug?: string; date_from?: string; date_to?: string; filter_count: number };
export type StandingsFilterProperties = { field: "competition" | "season" | "sort"; value: string };
export type TransfersFilterProperties = { field: "status" | "window" | "club"; value: string };
export type PaginationClickProperties = { page: number; section: "news" | "fixtures" | "transfers" };
export type ScrollDepthProperties     = { depth: 25 | 50 | 75 | 100; page_type: "article" | "list" | "home" | string };
export type SearchProperties          = { query: string; results_count: number; section: string };
export type CtaClickProperties        = { label: string; destination: string; type: "mailto" | "internal" | "external" };
export type SessionStartProperties    = { landing_page: string; referrer: string; device_type: "mobile" | "tablet" | "desktop" };
export type SessionEndProperties      = { duration_secs: number; page_count: number };

// Revenue
export type AdImpressionProperties = { slot_label: string; slot_size: string };
export type AdClickProperties      = { slot_label: string; slot_size: string };

// Performance
export type WebVitalsProperties = { metric: "LCP" | "CLS" | "TTFB" | "FCP" | "INP"; value: number; rating: "good" | "needs-improvement" | "poor" };
export type ImageLoadProperties = { src: string; duration_ms: number; success: boolean };
export type ErrorProperties     = { message: string; component?: string };

// ── Discriminated union ───────────────────────────────────────────────────────
// track() accepts AnalyticsEvent. TypeScript enforces that properties match
// the event name at every call site — no stringly-typed event names.
// Use the events factory below rather than constructing objects directly.

export type AnalyticsEvent =
  // ── Navigation ──────────────────────────────────────────────────────────────
  | { name: "page_view";          properties?: PageViewProperties }
  | { name: "nav_click";          properties:  NavClickProperties }
  | { name: "footer_link_click";  properties:  FooterLinkClickProperties }
  // ── Content ─────────────────────────────────────────────────────────────────
  | { name: "article_view";         properties: ArticleViewProperties }
  | { name: "article_complete";     properties: ArticleCompleteProperties }
  | { name: "article_share";        properties: ArticleShareProperties }
  | { name: "related_article_click";properties: RelatedArticleClickProperties }
  | { name: "fixture_view";         properties: FixtureViewProperties }
  | { name: "fixture_open";         properties: FixtureOpenProperties }
  | { name: "standings_view";       properties: StandingsViewProperties }
  | { name: "transfer_view";        properties: TransferViewProperties }
  | { name: "club_view";            properties: ClubViewProperties }
  | { name: "player_view";          properties: PlayerViewProperties }
  // ── Engagement ──────────────────────────────────────────────────────────────
  | { name: "category_filter";   properties: CategoryFilterProperties }
  | { name: "fixture_filter";    properties: FixtureFilterProperties }
  | { name: "fixture_filter_clear" }
  | { name: "standings_filter";  properties: StandingsFilterProperties }
  | { name: "transfers_filter";  properties: TransfersFilterProperties }
  | { name: "pagination_click";  properties: PaginationClickProperties }
  | { name: "scroll_depth";      properties: ScrollDepthProperties }
  | { name: "search";            properties: SearchProperties }
  | { name: "cta_click";         properties: CtaClickProperties }
  | { name: "session_start";     properties: SessionStartProperties }
  | { name: "session_end";       properties: SessionEndProperties }
  // ── Revenue ─────────────────────────────────────────────────────────────────
  | { name: "ad_impression"; properties: AdImpressionProperties }
  | { name: "ad_click";      properties: AdClickProperties }
  // ── Performance ─────────────────────────────────────────────────────────────
  | { name: "web_vitals";  properties: WebVitalsProperties }
  | { name: "image_load";  properties: ImageLoadProperties }
  | { name: "error";       properties: ErrorProperties };

/** All valid event name strings — useful for TypeScript generics and tests. */
export type EventName = AnalyticsEvent["name"];

// ── Event factories ───────────────────────────────────────────────────────────
// The only way components should build events.
//
// Usage:
//   import { events } from "@/lib/analytics/events";
//   track(events.articleView({ slug, title, category, ... }));
//
// TypeScript enforces that all required properties are present.

export const events = {
  // Navigation
  pageView:        (properties?: PageViewProperties):          AnalyticsEvent => ({ name: "page_view", properties }),
  navClick:        (properties:  NavClickProperties):          AnalyticsEvent => ({ name: "nav_click", properties }),
  footerLinkClick: (properties:  FooterLinkClickProperties):   AnalyticsEvent => ({ name: "footer_link_click", properties }),

  // Content
  articleView:          (properties: ArticleViewProperties):          AnalyticsEvent => ({ name: "article_view", properties }),
  articleComplete:      (properties: ArticleCompleteProperties):      AnalyticsEvent => ({ name: "article_complete", properties }),
  articleShare:         (properties: ArticleShareProperties):         AnalyticsEvent => ({ name: "article_share", properties }),
  relatedArticleClick:  (properties: RelatedArticleClickProperties):  AnalyticsEvent => ({ name: "related_article_click", properties }),
  fixtureView:          (properties: FixtureViewProperties):          AnalyticsEvent => ({ name: "fixture_view", properties }),
  fixtureOpen:          (properties: FixtureOpenProperties):          AnalyticsEvent => ({ name: "fixture_open", properties }),
  standingsView:        (properties: StandingsViewProperties):        AnalyticsEvent => ({ name: "standings_view", properties }),
  transferView:         (properties: TransferViewProperties):         AnalyticsEvent => ({ name: "transfer_view", properties }),
  clubView:             (properties: ClubViewProperties):             AnalyticsEvent => ({ name: "club_view", properties }),
  playerView:           (properties: PlayerViewProperties):           AnalyticsEvent => ({ name: "player_view", properties }),

  // Engagement
  categoryFilter:   (properties: CategoryFilterProperties):   AnalyticsEvent => ({ name: "category_filter", properties }),
  fixtureFilter:    (properties: FixtureFilterProperties):    AnalyticsEvent => ({ name: "fixture_filter", properties }),
  fixtureFilterClear: ():                                     AnalyticsEvent => ({ name: "fixture_filter_clear" }),
  standingsFilter:  (properties: StandingsFilterProperties):  AnalyticsEvent => ({ name: "standings_filter", properties }),
  transfersFilter:  (properties: TransfersFilterProperties):  AnalyticsEvent => ({ name: "transfers_filter", properties }),
  paginationClick:  (properties: PaginationClickProperties):  AnalyticsEvent => ({ name: "pagination_click", properties }),
  scrollDepth:      (properties: ScrollDepthProperties):      AnalyticsEvent => ({ name: "scroll_depth", properties }),
  search:           (properties: SearchProperties):           AnalyticsEvent => ({ name: "search", properties }),
  ctaClick:         (properties: CtaClickProperties):         AnalyticsEvent => ({ name: "cta_click", properties }),
  sessionStart:     (properties: SessionStartProperties):     AnalyticsEvent => ({ name: "session_start", properties }),
  sessionEnd:       (properties: SessionEndProperties):       AnalyticsEvent => ({ name: "session_end", properties }),

  // Revenue
  adImpression: (properties: AdImpressionProperties): AnalyticsEvent => ({ name: "ad_impression", properties }),
  adClick:      (properties: AdClickProperties):       AnalyticsEvent => ({ name: "ad_click", properties }),

  // Performance
  webVitals: (properties: WebVitalsProperties): AnalyticsEvent => ({ name: "web_vitals", properties }),
  imageLoad:  (properties: ImageLoadProperties): AnalyticsEvent => ({ name: "image_load", properties }),
  error:      (properties: ErrorProperties):     AnalyticsEvent => ({ name: "error", properties }),
} as const;
