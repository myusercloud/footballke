"use client";

import { useEffect, useRef } from "react";
import { track, identify, page, reset } from "./analytics";

// ── useAnalytics ──────────────────────────────────────────────────────────────
// Convenience hook for client components that prefer a single import point.
// All calls route through analytics.ts — never to PostHog directly.

export function useAnalytics() {
  return { track, identify, page, reset } as const;
}

// ── useScrollDepth ────────────────────────────────────────────────────────────
// Fires scroll_depth events at 25 / 50 / 75 / 100% milestones.
// Each milestone fires at most once per component mount (i.e. per page load).
//
// RAF-throttled: the scroll listener only schedules one check per animation
// frame (~16 ms at 60 fps). Without this, a fast scroll can dispatch dozens
// of events per frame with no additional milestone information.

export function useScrollDepth(
  pageType: "article" | "list" | "home" | string
): void {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    // Reset milestones when pageType changes (e.g. navigating article → article)
    fired.current = new Set();

    let rafId: number | null = null;

    function check(): void {
      rafId = null;
      const doc = document.documentElement;
      const scrolled = doc.scrollTop + doc.clientHeight;
      const total = doc.scrollHeight;
      if (total === 0) return;

      const pct = (scrolled / total) * 100;

      for (const milestone of [25, 50, 75, 100] as const) {
        if (pct >= milestone && !fired.current.has(milestone)) {
          fired.current.add(milestone);
          track({
            name: "scroll_depth",
            properties: { depth: milestone, page_type: pageType },
          });
        }
      }
    }

    function onScroll(): void {
      // If a check is already queued for this frame, skip — no new information
      // will be available until the browser has painted.
      if (rafId !== null) return;
      rafId = requestAnimationFrame(check);
    }

    // Check immediately on mount (page may already be scrolled)
    check();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      // Cancel any pending RAF so the callback doesn't fire after unmount
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [pageType]);
}
