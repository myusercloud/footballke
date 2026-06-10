import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://footballke.com"),
  icons: {
    icon: "trophy.png",
    shortcut: "trophy.png",
    apple: "trophy.png",
  },
  title: {
    default: "FootballKE",
    template: "%s | FootballKE",
  },
  description:
    "Kenyan Premier League news, fixtures, standings, transfers, and analysis — from KPL to county football.",
  keywords: [
    "Kenya football",
    "KPL",
    "Kenyan Premier League",
    "Gor Mahia",
    "AFC Leopards",
    "Tusker FC",
    "Bandari FC",
    "KPL fixtures",
    "KPL table",
    "Kenya soccer",
  ],
  authors: [{ name: "FootballKE" }],
  openGraph: {
    title: "FootballKE — Kenyan Premier League",
    description:
      "KPL news, fixtures, standings, and transfers. Kenyan football in one place.",
    url: "https://footballke.com",
    siteName: "FootballKE",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FootballKE — Kenyan Premier League",
    description:
      "KPL news, fixtures, standings, and transfers. Kenyan football in one place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
