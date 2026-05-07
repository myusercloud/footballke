// src/app/layout.tsx
// Root layout — wraps every page. SEO meta, fonts, AdSense, analytics.

import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { seo } from "../../theme";

// ─── Fonts (next/font = zero layout shift, self-hosted) ──────────────────
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// ─── Default Metadata (overridden per-page via generateMetadata) ──────────
export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default:  seo.defaultTitle,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: [
    "AFCON 2027", "Africa Cup of Nations 2027", "Kenya football",
    "Talanta Stadium", "Barcelona Liverpool Nairobi", "football Kenya",
    "AFCON tickets", "Harambee Stars", "East Africa football",
  ],
  authors:  [{ name: "Football KE", url: seo.siteUrl }],
  creator:  "Football KE",
  publisher:"Football KE",

  // Open Graph
  openGraph: {
    type:        "website",
    locale:      seo.locale,
    url:         seo.siteUrl,
    siteName:    seo.siteName,
    title:       seo.defaultTitle,
    description: seo.description,
    images: [
      {
        url:    seo.ogImage,
        width:  1200,
        height: 630,
        alt:    "Football KE — AFCON 2027 & Barcelona vs Liverpool in Nairobi",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card:        "summary_large_image",
    site:        seo.twitterHandle,
    creator:     seo.twitterHandle,
    title:       seo.defaultTitle,
    description: seo.description,
    images:      [seo.ogImage],
  },

  // Robots
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // Verification (add when ready)
  // verification: {
  //   google:  "your-google-site-verification",
  //   yandex:  "your-yandex-verification",
  // },

  // Icons
  icons: {
    icon:    [
      { url: "/favicon.ico",           sizes: "any" },
      { url: "/icon.svg",              type: "image/svg+xml" },
      { url: "/favicon-32x32.png",     sizes: "32x32",  type: "image/png" },
      { url: "/favicon-16x16.png",     sizes: "16x16",  type: "image/png" },
    ],
    apple:   [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other:   [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#639922" }],
  },

  manifest: "/site.webmanifest",

  // Alternate languages (add Swahili later)
  // alternates: {
  //   canonical: seo.siteUrl,
  //   languages: { "sw": `${seo.siteUrl}/sw` },
  // },
};

// ─── Viewport ─────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width:            "device-width",
  initialScale:     1,
  themeColor:       "#0a1a0a",
  colorScheme:      "dark",
};

// ─── Root Layout ──────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const gaId      = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`dark ${bebasNeue.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* ── Preconnects for performance ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ── Structured Data (JSON-LD) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type":    "SportsOrganization",
              "name":     "Football KE",
              "url":      seo.siteUrl,
              "logo":     `${seo.siteUrl}/logo.png`,
              "sameAs": [
                "https://twitter.com/footballke",
                "https://instagram.com/footballke",
                "https://tiktok.com/@footballke",
              ],
              "description": seo.description,
            }),
          }}
        />
      </head>

      <body className="bg-page text-text-primary font-body antialiased">

        {/* ── Google Analytics (load after page is interactive) ── */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        )}

        {/* ── Google AdSense (async — never blocks rendering) ── */}
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"  // loads after everything else
          />
        )}

        {/* ── App ── */}
        {children}

      </body>
    </html>
  );
}