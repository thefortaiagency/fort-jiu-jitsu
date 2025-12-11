import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch',
  description: 'Contact The Fort Jiu-Jitsu in Fort Wayne, IN. Have questions about classes, schedules, or memberships? We\'re here to help you start your journey.',
  keywords: [
    'contact jiu jitsu fort wayne',
    'bjj gym phone number',
    'martial arts gym contact',
    'fort wayne bjj location',
  ],
  openGraph: {
    title: 'Contact Us | The Fort Jiu-Jitsu',
    description: 'Get in touch with Fort Wayne\'s premier BJJ academy. Questions about classes or memberships? Contact us today!',
  },
  alternates: {
    canonical: 'https://thefortjiujitsu.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
