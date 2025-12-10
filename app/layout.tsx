import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Fort Jiu-Jitsu | Forge Your Path. Master the Mat.",
  description: "Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu. Fort Wayne's premier integrated grappling academy.",
  keywords: "jiu jitsu, brazilian jiu jitsu, wrestling, grappling, fort wayne, martial arts, MMA, self defense",
  authors: [{ name: "The Fort Jiu-Jitsu" }],
  openGraph: {
    title: "The Fort Jiu-Jitsu | Forge Your Path. Master the Mat.",
    description: "Where the relentless spirit of wrestling meets the intricate art of Brazilian Jiu-Jitsu.",
    type: "website",
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
