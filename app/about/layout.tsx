import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Fort Wayne\'s Premier BJJ Academy',
  description: 'The Fort Jiu-Jitsu combines the relentless spirit of wrestling with the intricate art of Brazilian Jiu-Jitsu. Learn about our mission, values, and community in Fort Wayne.',
  keywords: [
    'about the fort jiu jitsu',
    'fort wayne bjj academy',
    'brazilian jiu jitsu gym',
    'martial arts philosophy',
    'bjj community fort wayne',
  ],
  openGraph: {
    title: 'About Us | The Fort Jiu-Jitsu',
    description: 'Where wrestling meets Brazilian Jiu-Jitsu. Learn about Fort Wayne\'s premier grappling academy.',
  },
  alternates: {
    canonical: 'https://thefortjiujitsu.com/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
