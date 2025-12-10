import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  isWaiverValid,
  getWaiverExpiration,
  daysUntilExpiration,
  needsAdultWaiver,
  getWaiverWarningMessage
} from '@/lib/waiver-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get member info for birth date
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('birth_date')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Get most recent waiver
    const { data: waiver, error: waiverError } = await supabase
      .from('waivers')
      .select('id, signed_at, signer_relationship, waiver_type')
      .eq('member_id', memberId)
      .eq('waiver_type', 'liability')
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    // No waiver found
    if (waiverError || !waiver) {
      return NextResponse.json({
        valid: false,
        expiresAt: null,
        needsRenewal: true,
        turnedAdult: false,
        daysUntilExpiration: null,
        warning: null
      });
    }

    // Check waiver status
    const valid = isWaiverValid(waiver.signed_at);
    const expiresAt = getWaiverExpiration(waiver.signed_at);
    const daysUntil = daysUntilExpiration(waiver.signed_at);
    const turnedAdult = needsAdultWaiver(
      member.birth_date,
      waiver.signed_at,
      waiver.signer_relationship
    );

    // Get warning message
    const warningInfo = getWaiverWarningMessage(
      member.birth_date,
      waiver.signed_at,
      waiver.signer_relationship
    );

    return NextResponse.json({
      valid: valid && !turnedAdult,
      expiresAt: expiresAt.toISOString(),
      needsRenewal: !valid || turnedAdult,
      turnedAdult,
      daysUntilExpiration: daysUntil,
      warning: warningInfo.message,
      warningType: warningInfo.type
    });
  } catch (error) {
    console.error('Waiver status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check waiver status' },
      { status: 500 }
    );
  }
}
