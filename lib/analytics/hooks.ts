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
// The listener is passive and removed on unmount.

export function useScrollDepth(
  pageType: "article" | "list" | "home" | string
): void {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    // Reset milestones when pageType changes (e.g. navigating article → article)
    fired.current = new Set();

    function onScroll(): void {
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

    // Check immediately (page may already be scrolled, e.g. restored scroll position)
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pageType]);
}
