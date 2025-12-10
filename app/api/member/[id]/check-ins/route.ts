import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verify member exists
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Get check-ins from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: checkIns, error: checkInsError } = await supabase
      .from('check_ins')
      .select('id, checked_in_at, class_id')
      .eq('member_id', memberId)
      .gte('checked_in_at', thirtyDaysAgo.toISOString())
      .order('checked_in_at', { ascending: false });

    if (checkInsError) {
      console.error('Check-ins fetch error:', checkInsError);
      return NextResponse.json(
        { error: 'Failed to fetch check-ins' },
        { status: 500 }
      );
    }

    // Count check-ins this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = checkIns?.filter(
      (c) => new Date(c.checked_in_at) >= startOfMonth
    ).length || 0;

    // Transform check-ins data
    const checkInsData = (checkIns || []).map((checkIn) => ({
      id: checkIn.id,
      checkInTime: checkIn.checked_in_at,
      classType: 'general',
    }));

    return NextResponse.json({
      checkIns: checkInsData,
      thisMonthCount,
      totalCount: checkInsData.length,
      period: '30 days',
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
