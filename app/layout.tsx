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
  title: "Musme | AI systems for ambitious businesses",
  description:
    "Musme designs AI automation, content systems, websites, apps, and custom software for healthcare, restaurants, and owner-led businesses.",
  alternates: { canonical: "/" },
  verification: { google: "b6jP-kvjVzTnQIP0DNLUY4U4GCf6548QcBdl_feErKo" },
  other: { "google-adsense-account": "ca-pub-4555492337139581" },
  openGraph: {
    title: "Musme | Less busywork. More business.",
    description:
      "AI systems, content, and digital products built around the way your business actually works.",
    type: "website",
    images: [{ url: "/images/musme-sectors-brand.png", width: 1584, height: 992 }],
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
