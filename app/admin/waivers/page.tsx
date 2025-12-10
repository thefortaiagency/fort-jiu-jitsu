import { redirect } from 'next/navigation';
import { createServerAuthClient } from '@/lib/supabase-server';
import WaiverManagement from './WaiverManagement';

export default async function WaiversPage() {
  const supabase = await createServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Fetch initial data for server-side rendering
  const { data: membersData } = await supabase
    .from('members')
    .select(`
      id,
      first_name,
      last_name,
      email,
      status,
      date_of_birth
    `)
    .order('last_name', { ascending: true });

  const { data: waiversData } = await supabase
    .from('waivers')
    .select('*')
    .order('signed_at', { ascending: false });

  return (
    <WaiverManagement
      user={user}
      initialMembers={membersData || []}
      initialWaivers={waiversData || []}
    />
  );
}
