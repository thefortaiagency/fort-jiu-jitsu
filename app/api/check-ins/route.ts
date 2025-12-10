import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - List check-ins for today
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('member_id');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query = supabase
      .from('check_ins')
      .select(`
        *,
        member:members(id, first_name, last_name, email, program)
      `)
      .gte('checked_in_at', today.toISOString())
      .lt('checked_in_at', tomorrow.toISOString())
      .order('checked_in_at', { ascending: false });

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching check-ins:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ checkIns: data });
  } catch (error) {
    console.error('Check-ins GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-ins' },
      { status: 500 }
    );
  }
}

// POST - Create a new check-in
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { member_id, check_in_method = 'kiosk', class_id, notes } = body;

    if (!member_id) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Verify member exists and is active
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, status')
      .eq('id', member_id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (member.status !== 'active') {
      return NextResponse.json(
        { error: 'Member is not active. Please contact staff.' },
        { status: 403 }
      );
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('member_id', member_id)
      .gte('checked_in_at', today.toISOString())
      .lt('checked_in_at', tomorrow.toISOString())
      .single();

    if (existingCheckIn) {
      return NextResponse.json(
        {
          error: 'Already checked in today',
          already_checked_in: true,
          member_name: `${member.first_name} ${member.last_name}`
        },
        { status: 409 }
      );
    }

    // Create check-in
    const { data: checkIn, error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        member_id,
        check_in_method,
        class_id,
        notes,
        checked_in_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (checkInError) {
      console.error('Error creating check-in:', checkInError);
      return NextResponse.json(
        { error: 'Failed to create check-in' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkIn,
      message: `Welcome, ${member.first_name}!`,
    });
  } catch (error) {
    console.error('Check-in POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}
