"use client";

// components/AdSlot.tsx
// Reusable AdSense wrapper — pre-reserves space so CLS = 0
// Usage: <AdSlot slot="leaderboard" />

import { useEffect, useRef } from "react";
import { adSlots } from "../../theme";

type SlotName = keyof typeof adSlots;

interface AdSlotProps {
  slot:      SlotName;
  className?: string;
  label?:    boolean;  // show "Advertisement" label above (good practice)
}

// Map slot names to AdSense data-ad-slot IDs
// Replace these with your real slot IDs from AdSense dashboard
const AD_SLOT_IDS: Record<SlotName, string> = {
  leaderboard:  "1234567890",  // replace with real AdSense slot ID
  sidebarTop:   "2345678901",
  sidebarMid:   "3456789012",
  inline:       "4567890123",
  mobileFooter: "5678901234",
  mobileInline: "6789012345",
};

// CSS class map (defined in globals.css — pre-reserves dimensions)
const SLOT_CLASSES: Record<SlotName, string> = {
  leaderboard:  "ad-leaderboard",
  sidebarTop:   "ad-sidebar-top",
  sidebarMid:   "ad-sidebar-mid",
  inline:       "ad-inline",
  mobileFooter: "ad-mobile-footer",
  mobileInline: "ad-mobile-inline",
};

export default function AdSlot({ slot, className = "", label = true }: AdSlotProps) {
  const adRef  = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || pushed.current) return;
    try {
      // @ts-expect-error — adsbygoogle is injected by Google's script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet — fail silently
    }
  }, [adsenseId]);

  // In development or if no AdSense ID — show placeholder
  if (!adsenseId || process.env.NODE_ENV === "development") {
    const config = adSlots[slot];
    return (
      <div className={`ad-slot ${SLOT_CLASSES[slot]} ${className}`}>
        <div
          style={{
            width:           "100%",
            height:          "100%",
            border:          "1px dashed #2d422d",
            borderRadius:    "var(--radius-md)",
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            justifyContent:  "center",
            gap:             "4px",
            background:      "rgba(99,153,34,0.04)",
          }}
        >
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2px", color: "#3B6D11", textTransform: "uppercase" }}>
            Ad Slot
          </span>
          <span style={{ fontSize: "11px", color: "#627559" }}>
            {config.w} × {config.h}
          </span>
          <span style={{ fontSize: "10px", color: "#3B6D11", textAlign: "center", padding: "0 8px" }}>
            {config.note}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-slot ${SLOT_CLASSES[slot]} ${className}`} ref={adRef}>
      {label && (
        <p
          style={{
            fontSize:      "9px",
            fontWeight:    600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color:         "var(--text-tertiary)",
            textAlign:     "center",
            marginBottom:  "2px",
            lineHeight:    1,
          }}
        >
          Advertisement
        </p>
      )}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseId}
        data-ad-slot={AD_SLOT_IDS[slot]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── Sticky Mobile Footer Ad ─────────────────────────────────────────────────
export function StickyMobileAd() {
  return (
    <div className="ad-sticky-footer">
      <AdSlot slot="mobileFooter" label={false} />
    </div>
  );
}