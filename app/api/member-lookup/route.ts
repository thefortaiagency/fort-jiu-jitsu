import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

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
      .select('id, signed_at, waiver_type')
      .eq('member_id', member.id)
      .eq('waiver_type', 'liability')
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const hasValidWaiver = waiver && new Date(waiver.signed_at) > oneYearAgo;

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
        hasValidWaiver,
        waiverExpires: waiver ? new Date(new Date(waiver.signed_at).setFullYear(new Date(waiver.signed_at).getFullYear() + 1)).toISOString() : null,
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
