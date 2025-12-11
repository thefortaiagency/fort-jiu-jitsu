import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Instructors - Expert BJJ Coaches',
  description: 'Meet The Fort Jiu-Jitsu\'s experienced instructors. Learn from dedicated coaches passionate about teaching Brazilian Jiu-Jitsu to students of all levels.',
  keywords: [
    'jiu jitsu instructors fort wayne',
    'bjj coaches indiana',
    'martial arts teachers',
    'experienced bjj instructors',
  ],
  openGraph: {
    title: 'Our Instructors | The Fort Jiu-Jitsu',
    description: 'Learn from experienced, passionate Brazilian Jiu-Jitsu coaches dedicated to your success.',
  },
  alternates: {
    canonical: 'https://thefortjiujitsu.com/instructors',
  },
};

export default function InstructorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
