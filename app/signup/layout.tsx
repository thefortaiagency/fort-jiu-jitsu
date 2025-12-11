import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Start Your Jiu-Jitsu Journey',
  description: 'Join The Fort Jiu-Jitsu today! Kids classes $75/mo, Adult classes $100/mo, Drop-in $20. No experience required. Sign up online and start training.',
  keywords: [
    'sign up jiu jitsu fort wayne',
    'join bjj gym',
    'jiu jitsu membership',
    'kids martial arts registration',
    'adult bjj membership',
    'jiu jitsu pricing',
  ],
  openGraph: {
    title: 'Sign Up | The Fort Jiu-Jitsu',
    description: 'Start your martial arts journey today. Kids $75/mo, Adults $100/mo. No experience required!',
  },
  alternates: {
    canonical: 'https://thefortjiujitsu.com/signup',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
