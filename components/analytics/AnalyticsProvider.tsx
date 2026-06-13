"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, track, page } from "@/lib/analytics/analytics";
import { PostHogProvider } from "@/lib/analytics/posthog.provider";
import { events } from "@/lib/analytics/events";
import { AnalyticsDebugPanel } from "./AnalyticsDebugPanel";

// web-vitals is bundled with Next.js — dynamic import keeps it out of the
// critical path so it doesn't delay the initial render.
type VitalsMetric = {
  name: "CLS" | "FCP" | "INP" | "LCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
};

// Module-level flag so web vitals observers are registered exactly once.
// A useRef would be reset between Strict Mode unmount/remount cycles;
// a module-level variable survives them, which is what we need because
// PerformanceObserver is a browser-level resource — double-registering
// via onCLS() / onLCP() etc. produces duplicate metrics in dev.
let _vitalsRegistered = false;

// ── RouteWatcher ──────────────────────────────────────────────────────────────
// Fires page_view on every client-side navigation after the initial load.
// Wrapped in Suspense by AnalyticsProvider because useSearchParams requires it
// in Next.js App Router.

function RouteWatcher(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip first mount — AnalyticsProvider fires the initial page_view.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    page();
    track(events.pageView());
  }, [pathname, searchParams]);

  return null;
}

// ── AnalyticsProvider ─────────────────────────────────────────────────────────
// Drop-in wrapper for app/layout.tsx.
//
// On mount:
//   1. Initialises PostHogProvider if NEXT_PUBLIC_POSTHOG_KEY is set.
//      If the key is absent (CI, preview) analytics silently no-ops.
//   2. Fires session_start once per browser session (guarded by sessionStorage).
//   3. Fires the initial page_view.
//   4. Registers web vitals reporters (CLS, FCP, INP, LCP, TTFB) — once only.
//
// On every route change: RouteWatcher fires page_view.
// On unmount: initAnalytics(null) disables tracking so Strict Mode's
//   cleanup pass doesn't leave a stale provider active during remount.

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

    // Only connect to PostHog in production — avoids network errors and
    // console spam when running locally without a reachable PostHog server.
    const isProduction = process.env.NODE_ENV === "production";
    initAnalytics(key && isProduction ? new PostHogProvider(key, host) : null);

    // session_start — once per browser session
    try {
      if (!sessionStorage.getItem("_fk_ss")) {
        sessionStorage.setItem("_fk_ss", "1");
        const w = window.innerWidth;
        track(
          events.sessionStart({
            landing_page: window.location.pathname + window.location.search,
            referrer: document.referrer,
            device_type: w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop",
          })
        );
      }
    } catch {
      // sessionStorage blocked (strict private browsing)
    }

    // Initial page view
    page();
    track(events.pageView());

    // Web vitals — registered once; module-level flag survives Strict Mode cycles
    if (!_vitalsRegistered) {
      _vitalsRegistered = true;
      void import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
        function report({ name, value, rating }: VitalsMetric): void {
          track(events.webVitals({ metric: name, value, rating }));
        }
        onCLS(report as Parameters<typeof onCLS>[0]);
        onFCP(report as Parameters<typeof onFCP>[0]);
        onINP(report as Parameters<typeof onINP>[0]);
        onLCP(report as Parameters<typeof onLCP>[0]);
        onTTFB(report as Parameters<typeof onTTFB>[0]);
      });
    }

    return () => {
      // Disable tracking during Strict Mode cleanup window so the stale
      // provider can't fire events between unmount and remount.
      initAnalytics(null);
    };
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteWatcher />
      </Suspense>
      {children}
      {process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true" && (
        <AnalyticsDebugPanel />
      )}
    </>
  );
}
