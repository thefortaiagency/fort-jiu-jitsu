import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { LocalBusinessJsonLd, CourseJsonLd } from "./components/JsonLd";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import BJJChatbot from "./components/BJJChatbot";

const siteUrl = "https://thefortjiujitsu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Fort Jiu-Jitsu | Brazilian Jiu-Jitsu & Wrestling in Fort Wayne, IN",
    template: "%s | The Fort Jiu-Jitsu"
  },
  description: "Fort Wayne's premier Brazilian Jiu-Jitsu academy serving Northeast Indiana. 100+ technique library, expert instruction for kids & adults, morning rolls & evening classes. Join the best BJJ gym in Allen County!",
  keywords: [
    // Fort Wayne core
    "jiu jitsu fort wayne",
    "brazilian jiu jitsu fort wayne",
    "bjj fort wayne indiana",
    "wrestling classes fort wayne",
    "martial arts fort wayne",
    "kids jiu jitsu fort wayne",
    "adult jiu jitsu classes",
    "self defense fort wayne",
    "grappling academy indiana",
    "mma training fort wayne",
    "the fort jiu jitsu",
    // Northeast Indiana expansion
    "jiu jitsu northeast indiana",
    "bjj allen county",
    "martial arts new haven indiana",
    "jiu jitsu columbia city",
    "bjj huntington indiana",
    "wrestling auburn indiana",
    "martial arts bluffton indiana",
    "jiu jitsu decatur indiana",
    "bjj angola indiana",
    "grappling northeast indiana",
    // Program-specific
    "kids martial arts fort wayne",
    "youth jiu jitsu indiana",
    "beginner bjj classes",
    "morning jiu jitsu classes",
    "gi jiu jitsu training",
    "private jiu jitsu lessons",
    // Technique-focused
    "bjj techniques library",
    "learn jiu jitsu submissions",
    "guard passes bjj",
    "mount escapes jiu jitsu",
    "armbar technique",
    "triangle choke training"
  ],
  authors: [{ name: "The Fort Jiu-Jitsu", url: siteUrl }],
  creator: "The Fort Jiu-Jitsu",
  publisher: "The Fort Jiu-Jitsu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "The Fort Jiu-Jitsu | Brazilian Jiu-Jitsu & Wrestling in Fort Wayne",
    description: "Northeast Indiana's premier BJJ academy with 100+ technique library. Kids & adult classes, morning rolls, private training. Serving Fort Wayne, Allen County & surrounding areas.",
    url: siteUrl,
    siteName: "The Fort Jiu-Jitsu",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Fort Jiu-Jitsu - Sensei Bot',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Fort Jiu-Jitsu | BJJ & Wrestling in Fort Wayne",
    description: "Northeast Indiana's premier BJJ academy. 100+ techniques, kids & adult classes, morning rolls. Serving Fort Wayne & Allen County.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'sports',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-white dark:bg-[#0a0a0a] text-[#1b1b1b] dark:text-[#f9f9f9]">
        <LocalBusinessJsonLd />
        <CourseJsonLd />
        <ServiceWorkerRegistration />
        {children}
        <BJJChatbot />
        <Analytics />
      </body>
    </html>
  );
}
