import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console | The Fort Jiu-Jitsu',
  description: 'Admin dashboard for managing members, classes, and more',
  robots: 'noindex, nofollow', // Don't index admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
