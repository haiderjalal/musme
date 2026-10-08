import type { Metadata } from "next";
import { DM_Serif_Display, Geist_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.musme.co"),
  title: {
    default: "Musme | AI systems for ambitious businesses",
    template: "%s",
  },
  description:
    "Musme designs AI automation, content systems, websites, apps, and custom software for healthcare, restaurants, and owner-led businesses.",
  alternates: { canonical: "/" },
  authors: [{ name: "Haider Jalal", url: "https://linkedin.com/in/haiderjalal" }],
  creator: "Haider Jalal",
  publisher: "Musme",
  keywords: ["AI automation agency", "AI content agency", "AI video generation", "web development", "custom software", "AI restaurant menus", "healthcare automation", "restaurant automation"],
  robots: { index: true, follow: true },
  verification: { google: "b6jP-kvjVzTnQIP0DNLUY4U4GCf6548QcBdl_feErKo" },
  other: { "google-adsense-account": "ca-pub-4555492337139581" },
  openGraph: {
    title: "Musme | Less busywork. More business.",
    description:
      "AI systems, content, and digital products built around the way your business actually works.",
    type: "website",
    url: "https://www.musme.co/",
    siteName: "Musme",
    locale: "en_US",
    images: [{ url: "/images/musme-sectors-brand.png", width: 1584, height: 992 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Musme | Less busywork. More business.",
    description: "AI systems, content, and digital products built around the way your business actually works.",
    images: ["/images/musme-sectors-brand.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${serif.variable} ${geistMono.variable}`}>
      <body>
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4555492337139581"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
