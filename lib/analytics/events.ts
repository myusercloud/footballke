// ── Event model — Phase 2 skeleton ───────────────────────────────────────────
//
// Phase 3 replaces the loose AnalyticsEvent type with a full discriminated
// union: { name: "article_view"; properties: ArticleViewProperties } | ...
//
// The track() signature in analytics.ts does NOT change between phases.
// Code written against the Phase 2 loose type remains valid after Phase 3
// narrows it — TypeScript will flag any mismatched property shapes at that
// point, making the migration incremental and compiler-guided.

export type AnalyticsEvent = {
  /** Snake_case event name. Phase 3 narrows this to a string literal union. */
  name: string;
  /** Event-specific properties. Phase 3 types these per event name. */
  properties?: Record<string, unknown>;
};
