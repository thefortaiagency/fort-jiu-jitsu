import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Get quick stats for admin dashboard
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // 1. Get active members count
    const { count: activeMembersCount, error: activeMembersError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeMembersError) {
      console.error('Error fetching active members count:', activeMembersError);
      return NextResponse.json({ error: activeMembersError.message }, { status: 500 });
    }

    // 2. Get check-ins today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: checkInsTodayCount, error: checkInsTodayError } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', today.toISOString())
      .lt('checked_in_at', tomorrow.toISOString());

    if (checkInsTodayError) {
      console.error('Error fetching check-ins today:', checkInsTodayError);
      return NextResponse.json({ error: checkInsTodayError.message }, { status: 500 });
    }

    // 3. Get check-ins this week
    const startOfWeek = new Date(today);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is start of week
    startOfWeek.setDate(startOfWeek.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: checkInsWeekCount, error: checkInsWeekError } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .gte('checked_in_at', startOfWeek.toISOString());

    if (checkInsWeekError) {
      console.error('Error fetching check-ins this week:', checkInsWeekError);
      return NextResponse.json({ error: checkInsWeekError.message }, { status: 500 });
    }

    // 4. Get waivers expiring in next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const expirationThreshold = new Date();
    expirationThreshold.setFullYear(expirationThreshold.getFullYear() - 1);
    expirationThreshold.setDate(expirationThreshold.getDate() + 30); // 1 year ago + 30 days = expires in 30 days

    // Get all waivers signed between 1 year + 30 days ago and 1 year ago
    // This means they will expire within the next 30 days
    const { data: expiringWaivers, error: waiversError } = await supabase
      .from('waivers')
      .select('member_id, signed_at')
      .gte('signed_at', expirationThreshold.toISOString())
      .lt('signed_at', oneYearAgo.toISOString())
      .order('signed_at', { ascending: false });

    if (waiversError) {
      console.error('Error fetching expiring waivers:', waiversError);
      return NextResponse.json({ error: waiversError.message }, { status: 500 });
    }

    // Get unique member IDs with expiring waivers
    const uniqueMemberIds = new Set(
      expiringWaivers?.map((waiver) => waiver.member_id) || []
    );

    // Verify these members are active
    const { count: expiringWaiversCount, error: activeMembersWithExpiringWaiversError } =
      await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .in('id', Array.from(uniqueMemberIds));

    if (activeMembersWithExpiringWaiversError) {
      console.error('Error fetching active members with expiring waivers:', activeMembersWithExpiringWaiversError);
      return NextResponse.json({ error: activeMembersWithExpiringWaiversError.message }, { status: 500 });
    }

    return NextResponse.json({
      activeMembers: activeMembersCount || 0,
      checkInsToday: checkInsTodayCount || 0,
      checkInsThisWeek: checkInsWeekCount || 0,
      expiringWaivers: expiringWaiversCount || 0,
    });
  } catch (error) {
    console.error('Admin stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
