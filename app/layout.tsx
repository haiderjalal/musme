import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
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
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
