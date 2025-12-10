import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import {
  isWaiverValid,
  getWaiverExpiration,
  needsAdultWaiver
} from '@/lib/waiver-utils';

// GET /api/member-lookup?id=xxx - Look up member by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Look up member by ID
    const { data: member, error } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        birth_date,
        status,
        payment_status,
        membership_type,
        program,
        stripe_customer_id,
        stripe_subscription_id,
        is_primary_account_holder,
        family_account_id,
        created_at
      `)
      .eq('id', memberId)
      .single();

    if (error || !member) {
      return NextResponse.json({
        found: false,
        member: null,
      }, { status: 404 });
    }

    // Check for valid waiver
    const { data: waiver } = await supabase
      .from('waivers')
      .select('id, signed_at, waiver_type, signer_relationship')
      .eq('member_id', member.id)
      .eq('waiver_type', 'liability')
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    const hasValidWaiver = waiver && isWaiverValid(waiver.signed_at);
    const turnedAdult = waiver && member.birth_date
      ? needsAdultWaiver(member.birth_date, waiver.signed_at, waiver.signer_relationship)
      : false;

    return NextResponse.json({
      found: true,
      member: {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        membershipType: member.membership_type,
        program: member.program,
        status: member.status,
        hasValidWaiver: hasValidWaiver && !turnedAdult,
        waiverExpires: waiver ? getWaiverExpiration(waiver.signed_at).toISOString() : null,
        hasStripeCustomer: !!member.stripe_customer_id,
        hasActiveSubscription: !!member.stripe_subscription_id,
        isPrimaryAccountHolder: member.is_primary_account_holder,
        familyAccountId: member.family_account_id,
        memberSince: member.created_at,
      },
    });
  } catch (error) {
    console.error('Member lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up member' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Look up member by email
    const { data: member, error } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        email,
        birth_date,
        status,
        payment_status,
        membership_type,
        program,
        stripe_customer_id,
        stripe_subscription_id,
        created_at
      `)
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !member) {
      // No member found - they're new
      return NextResponse.json({
        found: false,
        member: null,
      });
    }

    // Check for valid waiver (within last year)
    const { data: waiver } = await supabase
      .from('waivers')
      .select('id, signed_at, waiver_type, signer_relationship')
      .eq('member_id', member.id)
      .eq('waiver_type', 'liability')
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    const hasValidWaiver = waiver && isWaiverValid(waiver.signed_at);

    // Check if member turned 18 and needs new waiver
    const turnedAdult = waiver && member.birth_date
      ? needsAdultWaiver(member.birth_date, waiver.signed_at, waiver.signer_relationship)
      : false;

    // Determine member state
    let memberState: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'pending';

    if (member.status === 'active' && member.payment_status === 'active') {
      memberState = 'active';
    } else if (member.status === 'cancelled' || member.payment_status === 'cancelled') {
      memberState = 'cancelled';
    } else if (member.payment_status === 'past_due') {
      memberState = 'past_due';
    } else if (member.status === 'pending') {
      memberState = 'pending';
    } else {
      memberState = 'inactive';
    }

    return NextResponse.json({
      found: true,
      member: {
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        email: member.email,
        membershipType: member.membership_type,
        program: member.program,
        status: memberState,
        hasValidWaiver: hasValidWaiver && !turnedAdult,
        waiverExpires: waiver ? getWaiverExpiration(waiver.signed_at).toISOString() : null,
        turnedAdult,
        hasStripeCustomer: !!member.stripe_customer_id,
        hasActiveSubscription: !!member.stripe_subscription_id && memberState === 'active',
        memberSince: member.created_at,
      },
    });
  } catch (error) {
    console.error('Member lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up member' },
      { status: 500 }
    );
  }
}
