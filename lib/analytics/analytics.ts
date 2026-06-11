import type { AnalyticsProvider } from "./provider";
import type { AnalyticsEvent } from "./events";
import type { BaseProperties, DeviceType } from "./types";

// ── Module state ──────────────────────────────────────────────────────────────
// One provider instance shared across the process lifetime.
// Set once by initAnalytics() — called from <AnalyticsProvider> (Phase 5).

let _provider: AnalyticsProvider | null = null;
let _sessionId: string | null = null;

// ── Internal helpers ──────────────────────────────────────────────────────────

function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Respect browser Do Not Track signal.
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return false;
  return _provider !== null;
}

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  try {
    const stored = sessionStorage.getItem("_fk_sid");
    _sessionId = stored ?? crypto.randomUUID();
    if (!stored) sessionStorage.setItem("_fk_sid", _sessionId);
  } catch {
    // sessionStorage blocked (private browsing restrictions, etc.)
    _sessionId = crypto.randomUUID();
  }
  return _sessionId;
}

function getDeviceType(): DeviceType {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function buildBaseProperties(): BaseProperties {
  return {
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
    referrer: document.referrer,
    device_type: getDeviceType(),
    session_id: getSessionId(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────
// These four functions are the ONLY analytics interface the rest of the
// codebase is allowed to import. PostHog must never be imported directly
// outside of posthog.provider.ts.

/**
 * Register the analytics backend. Called once at app startup.
 * Pass null to disable analytics without errors (e.g. NEXT_PUBLIC_POSTHOG_KEY missing).
 */
export function initAnalytics(provider: AnalyticsProvider | null): void {
  _provider = provider;
}

/**
 * Fire a named event. Base properties are enriched automatically.
 * No-op if the provider is not initialised, window is undefined, or DNT is set.
 */
export function track(event: AnalyticsEvent): void {
  if (!isEnabled()) return;
  _provider!.capture(event.name, {
    ...buildBaseProperties(),
    ...(event.properties ?? {}),
  });
}

/**
 * Associate subsequent events with a stable user identity.
 * Reserved for future authenticated flows — FootballKE has no auth today.
 */
export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!isEnabled()) return;
  _provider!.identify(userId, traits);
}

/**
 * Fire a page-view event. Base properties are enriched automatically.
 * Called by <AnalyticsProvider> on every route change (Phase 5) — pages
 * and components should not call this manually.
 */
export function page(properties?: Record<string, unknown>): void {
  if (!isEnabled()) return;
  _provider!.page({ ...buildBaseProperties(), ...(properties ?? {}) });
}

/**
 * Clear user identity and reset the session ID.
 * Call on logout or when the user clears their data.
 */
export function reset(): void {
  _provider?.reset();
  _sessionId = null;
}
