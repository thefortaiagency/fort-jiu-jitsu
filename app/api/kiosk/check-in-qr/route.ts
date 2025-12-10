import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Look up member by QR code
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, first_name, last_name, status, payment_status')
      .eq('qr_code', qrCode)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 });
    }

    // Verify member is active
    if (member.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Member account is not active',
          memberName: `${member.first_name} ${member.last_name}`,
        },
        { status: 403 }
      );
    }

    if (member.payment_status !== 'active') {
      return NextResponse.json(
        {
          error: 'Payment status is not active',
          memberName: `${member.first_name} ${member.last_name}`,
        },
        { status: 403 }
      );
    }

    // Check if waiver is valid (signed within last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: waiver, error: waiverError } = await supabase
      .from('waivers')
      .select('id, signed_at')
      .eq('member_id', member.id)
      .eq('waiver_type', 'liability')
      .gte('signed_at', oneYearAgo.toISOString())
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    if (waiverError || !waiver) {
      return NextResponse.json(
        {
          error: 'No valid waiver on file',
          memberName: `${member.first_name} ${member.last_name}`,
        },
        { status: 403 }
      );
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existingCheckIn } = await supabase
      .from('check_ins')
      .select('id')
      .eq('member_id', member.id)
      .gte('check_in_time', today.toISOString())
      .single();

    if (existingCheckIn) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        memberName: `${member.first_name} ${member.last_name}`,
        message: 'Already checked in today',
      });
    }

    // Create check-in record
    const { error: checkInError } = await supabase
      .from('check_ins')
      .insert({
        member_id: member.id,
        class_type: 'general',
        check_in_time: new Date().toISOString(),
      });

    if (checkInError) {
      console.error('Check-in error:', checkInError);
      return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      memberName: `${member.first_name} ${member.last_name}`,
      message: 'Check-in successful',
    });
  } catch (error) {
    console.error('QR check-in error:', error);
    return NextResponse.json(
      { error: 'Check-in failed' },
      { status: 500 }
    );
  }
}
