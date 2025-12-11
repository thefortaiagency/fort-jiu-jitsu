import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Class Schedule - Kids & Adult BJJ Classes',
  description: 'View our weekly Brazilian Jiu-Jitsu class schedule. Kids classes Tue & Wed 5:30-6:30 PM, Adult classes 6:30-8:00 PM, plus Morning Rolls. Fort Wayne, IN.',
  keywords: [
    'jiu jitsu class schedule fort wayne',
    'bjj classes times',
    'kids martial arts schedule',
    'adult jiu jitsu evening classes',
    'morning jiu jitsu classes',
  ],
  openGraph: {
    title: 'Class Schedule | The Fort Jiu-Jitsu',
    description: 'Kids BJJ Tue & Wed 5:30-6:30 PM, Adult BJJ 6:30-8:00 PM. Join us for world-class instruction in Fort Wayne.',
  },
  alternates: {
    canonical: 'https://thefortjiujitsu.com/schedule',
  },
};

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
