import { redirect } from 'next/navigation';
import { createServerAuthClient } from '@/lib/supabase-server';
import { createServerSupabaseClient } from '@/lib/supabase';
import WaiverManagement from './WaiverManagement';

export const dynamic = 'force-dynamic';

export default async function WaiversPage() {
  try {
    // Use auth client for user verification
    const authClient = await createServerAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      redirect('/admin/login');
    }

    // Use service role client for data fetching (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Fetch initial data for server-side rendering
    const [membersResult, waiversResult] = await Promise.all([
      supabase
        .from('members')
        .select(`
          id,
          first_name,
          last_name,
          email,
          status,
          birth_date
        `)
        .eq('status', 'active')
        .order('last_name', { ascending: true }),
      supabase
        .from('waivers')
        .select('*')
        .order('signed_at', { ascending: false })
    ]);

    return (
      <WaiverManagement
        user={user}
        initialMembers={membersResult.data || []}
        initialWaivers={waiversResult.data || []}
      />
    );
  } catch (error) {
    console.error('Waivers page error:', error);
    redirect('/admin/login');
  }
}
