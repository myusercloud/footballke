import posthog from "posthog-js";
import type { AnalyticsProvider } from "./provider";

// ── PostHogProvider ───────────────────────────────────────────────────────────
// Wraps posthog-js. Constructed once by <AnalyticsProvider> (Phase 5) only
// when NEXT_PUBLIC_POSTHOG_KEY is present. If the key is missing,
// initAnalytics(null) is called instead and all analytics silently no-op.

export class PostHogProvider implements AnalyticsProvider {
  constructor(key: string, host: string) {
    posthog.init(key, {
      api_host: host,
      // We fire $pageview ourselves via page() — disable PostHog's auto-capture
      // so we don't double-count page views on route changes.
      capture_pageview: false,
      capture_pageleave: true,
      // All events are fired explicitly through track() — no click/input capture.
      autocapture: false,
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") ph.debug(true);
      },
    });
  }

  capture(eventName: string, properties: Record<string, unknown>): void {
    posthog.capture(eventName, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    posthog.identify(userId, traits);
  }

  page(properties: Record<string, unknown>): void {
    posthog.capture("$pageview", properties);
  }

  reset(): void {
    posthog.reset();
  }
}
