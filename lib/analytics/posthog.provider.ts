import type { AnalyticsProvider } from "./provider";

// ── PostHogProvider — Phase 2 stub ────────────────────────────────────────────
//
// Full implementation is Phase 4.
// Phase 4 will:
//   1. npm install posthog-js
//   2. Read NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
//   3. Call posthog.init() inside the constructor
//   4. Implement each method with the real posthog-js calls
//
// Until Phase 4, this class is a silent no-op. initAnalytics() in Phase 5's
// <AnalyticsProvider> component will not instantiate this until Phase 4 wires
// it up.

export class PostHogProvider implements AnalyticsProvider {
  capture(_eventName: string, _properties: Record<string, unknown>): void {
    // Phase 4: posthog.capture(eventName, properties)
  }

  identify(_userId: string, _traits?: Record<string, unknown>): void {
    // Phase 4: posthog.identify(userId, traits)
  }

  page(_properties: Record<string, unknown>): void {
    // Phase 4: posthog.capture("$pageview", properties)
  }

  reset(): void {
    // Phase 4: posthog.reset()
  }
}
