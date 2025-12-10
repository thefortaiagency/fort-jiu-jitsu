import { redirect } from 'next/navigation';
import { createServerAuthClient } from '@/lib/supabase-server';
import AdminDashboard from './components/AdminDashboard';

export default async function AdminPage() {
  const supabase = await createServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <AdminDashboard user={user} />;
}
