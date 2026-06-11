"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/analytics/analytics";
import type { AnalyticsEvent } from "@/lib/analytics/events";

type Props = ComponentProps<typeof Link> & { trackEvent: AnalyticsEvent };

// Thin wrapper around Next.js Link that fires a typed analytics event on click.
// Use this in server components to add tracking without making the parent "use client".
export function TrackedLink({ trackEvent, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(trackEvent);
        onClick?.(e);
      }}
    />
  );
}
