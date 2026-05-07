/** @type {import('tailwindcss').Config} */
const theme = require("./theme");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // we always use dark — add class="dark" to <html>
  theme: {
    extend: {

      // ── Colors ─────────────────────────────────────────────────────────
      colors: {
        // Base
        page:     theme.colors.base.page,
        surface:  theme.colors.base.surface,
        card:     theme.colors.base.card,
        elevated: theme.colors.base.elevated,
        border:   theme.colors.base.border,
        "border-hover": theme.colors.base.borderHover,

        // Palettes
        green:  theme.colors.green,
        amber:  theme.colors.amber,
        red:    theme.colors.red,
        blue:   theme.colors.blue,
        gray:   theme.colors.gray,

        // Semantic shortcuts
        brand:     theme.colors.brand,
        "brand-hover": theme.colors.brandHover,
        afcon:     theme.colors.afcon,
        barca:     theme.colors.barca,
        info:      theme.colors.link,
        muted:     theme.colors.muted,

        // Text
        "text-primary":   theme.colors.text.primary,
        "text-secondary": theme.colors.text.secondary,
        "text-tertiary":  theme.colors.text.tertiary,
        "text-inverse":   theme.colors.text.inverse,
        "text-brand":     theme.colors.text.brand,
        "text-gold":      theme.colors.text.gold,
        "text-red":       theme.colors.text.red,
      },

      // ── Typography ─────────────────────────────────────────────────────
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
        mono:    ["JetBrains Mono", "Fira Code", "monospace"],
      },

      fontSize: {
        "hero-xl":  ["96px",  { lineHeight: "0.95", letterSpacing: "4px" }],
        "hero":     ["72px",  { lineHeight: "0.95", letterSpacing: "3px" }],
        "section":  ["48px",  { lineHeight: "1",    letterSpacing: "2px" }],
        "card-title":["32px", { lineHeight: "1.05", letterSpacing: "1.5px" }],
        "score-xl": ["80px",  { lineHeight: "1",    letterSpacing: "6px" }],
        "score":    ["48px",  { lineHeight: "1",    letterSpacing: "4px" }],
        "countdown":["56px",  { lineHeight: "1",    letterSpacing: "3px" }],
        "article":  ["22px",  { lineHeight: "1.35" }],
        "body-lg":  ["18px",  { lineHeight: "1.75" }],
        "body":     ["16px",  { lineHeight: "1.8"  }],
        "body-sm":  ["14px",  { lineHeight: "1.65" }],
        "nav":      ["13px",  { lineHeight: "1"    }],
        "caption":  ["12px",  { lineHeight: "1.4"  }],
        "label":    ["11px",  { lineHeight: "1",    letterSpacing: "3px" }],
        "badge":    ["10px",  { lineHeight: "1",    letterSpacing: "2px" }],
      },

      // ── Spacing ─────────────────────────────────────────────────────────
      spacing: {
        "nav-height":   theme.spacing.navHeight,
        "page-x":       theme.spacing.pagePadding,
        "section-gap":  theme.spacing.sectionGap,
        "card-pad":     theme.spacing.cardPadding,
        "card-pad-sm":  theme.spacing.cardPaddingSm,
      },

      // ── Border Radius ───────────────────────────────────────────────────
      borderRadius: {
        sm:   theme.radius.sm,
        md:   theme.radius.md,
        lg:   theme.radius.lg,
        xl:   theme.radius.xl,
        full: theme.radius.full,
      },

      // ── Max Widths ──────────────────────────────────────────────────────
      maxWidth: {
        page:    theme.maxWidth.page,
        content: theme.maxWidth.content,
        narrow:  theme.maxWidth.narrow,
      },

      // ── Shadows ─────────────────────────────────────────────────────────
      boxShadow: {
        sm:          theme.shadows.sm,
        md:          theme.shadows.md,
        lg:          theme.shadows.lg,
        "glow-green":theme.shadows.glow.green,
        "glow-amber":theme.shadows.glow.amber,
        "glow-red":  theme.shadows.glow.red,
      },

      // ── Z-Index ─────────────────────────────────────────────────────────
      zIndex: {
        base:     theme.zIndex.base,
        raised:   theme.zIndex.raised,
        dropdown: theme.zIndex.dropdown,
        sticky:   theme.zIndex.sticky,
        overlay:  theme.zIndex.overlay,
        modal:    theme.zIndex.modal,
        toast:    theme.zIndex.toast,
        tooltip:  theme.zIndex.tooltip,
      },

      // ── Animation ───────────────────────────────────────────────────────
      transitionDuration: {
        fast:   theme.animation.fast,
        normal: theme.animation.normal,
        slow:   theme.animation.slow,
        slower: theme.animation.slower,
      },
      transitionTimingFunction: {
        ease:   theme.animation.ease,
        spring: theme.animation.spring,
        sharp:  theme.animation.sharp,
      },

      // ── Keyframes & Animations ──────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.85)" },
        },
        ticker: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
        "count-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":   "fade-in 0.4s cubic-bezier(0,0,0.2,1) both",
        "slide-down":"slide-down 0.3s cubic-bezier(0,0,0.2,1) both",
        "pulse":     "pulse 2s ease-in-out infinite",
        "ticker":    "ticker 28s linear infinite",
        "count-up":  "count-up 0.35s cubic-bezier(0,0,0.2,1) both",
      },

      // ── Grid templates ──────────────────────────────────────────────────
      gridTemplateColumns: {
        "article":    theme.layout.articleGrid,
        "news-3":     theme.layout.newsGrid3,
        "news-2":     theme.layout.newsGrid2,
        "sidebar":    `1fr ${theme.layout.sidebarWidth}`,
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),  // npm i @tailwindcss/typography
    require("@tailwindcss/line-clamp"),  // npm i @tailwindcss/line-clamp
  ],
};