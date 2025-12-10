import { redirect } from 'next/navigation';
import { createServerAuthClient } from '@/lib/supabase-server';
import ClassManagement from './ClassManagement';

export default async function ClassesPage() {
  const supabase = await createServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <ClassManagement user={user} />;
}
