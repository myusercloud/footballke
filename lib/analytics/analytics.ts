import type { AnalyticsProvider } from "./provider";
import type { AnalyticsEvent } from "./events";
import type { BaseProperties, DeviceType } from "./types";

// ── Module state ──────────────────────────────────────────────────────────────
// One provider instance shared across the process lifetime.
// Set once by initAnalytics() — called from <AnalyticsProvider>.

let _provider: AnalyticsProvider | null = null;
let _sessionId: string | null = null;

// ── Debug infrastructure ──────────────────────────────────────────────────────
// Listeners are notified on every track() call regardless of whether the
// provider is initialised, so the debug panel works without a PostHog key.

export type DebugEntry = {
  name: string;
  properties: Record<string, unknown>;
  /** true = sent to PostHog; false = no-op'd (no key, DNT, SSR, etc.) */
  captured: boolean;
  ts: number;
};

type DebugListener = (entry: DebugEntry) => void;
const _debugListeners = new Set<DebugListener>();

/** Subscribe to analytics events. Returns an unsubscribe function. */
export function addDebugListener(listener: DebugListener): () => void {
  _debugListeners.add(listener);
  return () => void _debugListeners.delete(listener);
}

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
 * Debug listeners are always notified (even without a provider) so the panel
 * works during local development without a PostHog key.
 */
export function track(event: AnalyticsEvent): void {
  const props = (event as { name: string; properties?: Record<string, unknown> }).properties;
  const enabled = isEnabled();
  const inBrowser = typeof window !== "undefined";
  const hasListeners = _debugListeners.size > 0 && inBrowser;

  if (!enabled && !hasListeners) return;

  // Build enriched properties once — used by both the provider and listeners.
  const enriched: Record<string, unknown> = inBrowser
    ? { ...buildBaseProperties(), ...(props ?? {}) }
    : { ...(props ?? {}) };

  if (enabled) {
    _provider!.capture(event.name, enriched);
  }

  if (hasListeners) {
    const entry: DebugEntry = { name: event.name, properties: enriched, captured: enabled, ts: Date.now() };
    _debugListeners.forEach((l) => l(entry));
  }

  // Console output — inlined build-time constant, tree-shaken in production.
  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true") {
    console.group(`%c[FK Analytics] ${event.name}`, "color:#84cc16;font-weight:bold");
    console.log("properties:", enriched);
    console.log("captured:", enabled);
    console.groupEnd();
  }
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
 * Called by <AnalyticsProvider> on every route change — pages
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
