import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Fort Jiu-Jitsu | Forge Your Path. Master the Mat.",
  description: "Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu. Fort Wayne's premier integrated grappling academy.",
  keywords: "jiu jitsu, brazilian jiu jitsu, wrestling, grappling, fort wayne, martial arts, MMA, self defense",
  authors: [{ name: "The Fort Jiu-Jitsu" }],
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
  openGraph: {
    title: "The Fort Jiu-Jitsu | Forge Your Path. Master the Mat.",
    description: "Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu.",
    type: "website",
    images: [{ url: '/jiu-jitsu.png' }],
  },
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
        {children}
      </body>
    </html>
  );
}
