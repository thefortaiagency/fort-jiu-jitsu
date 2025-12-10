import { redirect } from 'next/navigation';
import { createServerAuthClient } from '@/lib/supabase-server';
import CheckInManagement from './CheckInManagement';

export default async function CheckInsPage() {
  const supabase = await createServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <CheckInManagement user={user} />;
}
