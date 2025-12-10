import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { memberId, classType } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Verify member exists and is active
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, status, payment_status')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.status !== 'active' || member.payment_status !== 'active') {
      return NextResponse.json(
        {
          error: 'Membership not active',
          status: member.status,
          paymentStatus: member.payment_status
        },
        { status: 403 }
      );
    }

    // Check if already checked in today for this class type
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('member_id', memberId)
      .gte('check_in_time', today.toISOString())
      .eq('class_type', classType || 'general')
      .single();

    if (existingCheckIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        message: `${member.first_name} is already checked in for today's class`,
      });
    }

    // Create check-in record
    const { data: checkIn, error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        member_id: memberId,
        class_type: classType || 'general',
        check_in_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (checkInError) {
      console.error('Check-in error:', checkInError);
      return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      checkIn: {
        id: checkIn.id,
        time: checkIn.check_in_time,
        classType: checkIn.class_type,
      },
      message: `Welcome, ${member.first_name}! You're checked in.`,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Check-in failed' },
      { status: 500 }
    );
  }
}

// Get check-in history for a member
export async function GET(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get last 30 check-ins
    const { data: checkIns, error } = await supabase
      .from('check_ins')
      .select('id, check_in_time, class_type')
      .eq('member_id', memberId)
      .order('check_in_time', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    // Count check-ins this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = checkIns?.filter(
      (c) => new Date(c.check_in_time) >= startOfMonth
    ).length || 0;

    return NextResponse.json({
      checkIns: checkIns || [],
      thisMonthCount,
      totalCount: checkIns?.length || 0,
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}
