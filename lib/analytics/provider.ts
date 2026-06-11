// ── AnalyticsProvider ─────────────────────────────────────────────────────────
//
// Contract between analytics.ts and any analytics backend.
//
// Responsibilities:
//   - Forward events to the backend (PostHog, Mixpanel, GA4, etc.)
//   - Never called directly by UI code — analytics.ts is the only caller
//
// Implementations:
//   PostHogProvider  — posthog-js (Phase 4, default)

export interface AnalyticsProvider {
  /**
   * Send a named event with its properties to the backend.
   * Called by track() — properties already include BaseProperties enrichment.
   */
  capture(eventName: string, properties: Record<string, unknown>): void;

  /**
   * Associate subsequent events with a known user identity.
   * Only called when you have a stable user ID (logged-in state, etc.).
   * FootballKE has no auth today — reserved for future use.
   */
  identify(userId: string, traits?: Record<string, unknown>): void;

  /**
   * Send a page-view event to the backend.
   * Called by page() — properties already include BaseProperties enrichment.
   * PostHog maps this to $pageview; other backends may do the same.
   */
  page(properties: Record<string, unknown>): void;

  /**
   * Clear the current user identity (e.g. on logout).
   * Resets the anonymous ID in the backend SDK.
   */
  reset(): void;
}
