import type { Metadata } from "next";
import "./globals.css";
import { LocalBusinessJsonLd, CourseJsonLd } from "./components/JsonLd";

const siteUrl = "https://thefortjiujitsu.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Fort Jiu-Jitsu | Brazilian Jiu-Jitsu & Wrestling in Fort Wayne, IN",
    template: "%s | The Fort Jiu-Jitsu"
  },
  description: "Fort Wayne's premier Brazilian Jiu-Jitsu academy. Expert instruction for kids & adults in BJJ and wrestling. Classes Tue & Wed evenings. Start your free trial today!",
  keywords: [
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
    "beginner jiu jitsu",
    "jiu jitsu near me",
    "the fort jiu jitsu"
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
    description: "Fort Wayne's premier Brazilian Jiu-Jitsu academy. Expert instruction for kids & adults. Start your martial arts journey today!",
    url: siteUrl,
    siteName: "The Fort Jiu-Jitsu",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: '/jiu-jitsu.png',
        width: 783,
        height: 349,
        alt: 'The Fort Jiu-Jitsu Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Fort Jiu-Jitsu | BJJ & Wrestling in Fort Wayne",
    description: "Fort Wayne's premier Brazilian Jiu-Jitsu academy. Expert instruction for kids & adults.",
    images: ['/jiu-jitsu.png'],
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
        {children}
      </body>
    </html>
  );
}
